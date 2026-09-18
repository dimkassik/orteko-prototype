import { useState } from 'react'
import { ArrowRight, Bell, ChevronRight, Package, Receipt, TriangleAlert, TrendingUp } from 'lucide-react'
import { ENGINEERS, HISTORY, SEPT_BASE } from '../data'
import {
  addDaysIso, amount, client, daysBetween, fmtDate, fmtHours, isOverdue, money, moneyShort, plural, slaLeft, sum, useStore,
} from '../store'
import { Avatar, Badge, Drawer, Empty } from '../ui'
import RequestDrawer from '../RequestDrawer'

const STAGES = [
  { id: 'done', title: 'Работа сделана', sub: 'акта нет', tone: 'leak1', hint: 'Инженер отработал, но клиент не подписал акт — счёт выставить нельзя.' },
  { id: 'act_signed', title: 'Акт подписан', sub: 'счёта нет', tone: 'leak2', hint: 'Всё готово для счёта — осталось нажать одну кнопку.' },
  { id: 'invoiced', title: 'Счёт выставлен', sub: 'оплаты нет', tone: 'leak3', hint: 'Клиент должен. Чем старше долг, тем меньше шансов его получить.' },
]

const doneAt = (r) => r.history.find((h) => h.text === 'Работа выполнена')?.at ?? r.createdAt
// «возраст» денег на шаге — сколько дней они там лежат
const ageOnStage = (r, now) => daysBetween(
  r.status === 'done' ? doneAt(r) : r.status === 'act_signed' ? r.act.signedAt : r.invoice.date, now)

function StageDrawer({ stage, onClose, open }) {
  const { state, dispatch, toast } = useStore()
  const list = state.requests.filter((r) => r.status === stage.id)
    .sort((a, b) => ageOnStage(b, state.clock) - ageOnStage(a, state.clock))
  const invoiceAll = () => {
    dispatch({ type: 'invoice', ids: list.map((r) => r.id) })
    toast(`Выставлено ${plural(list.length, 'счёт', 'счёта', 'счетов')} на ${money(sum(list))}`)
  }
  return (
    <Drawer title={`${stage.title}, ${stage.sub}`} subtitle={`${plural(list.length, 'заявка', 'заявки', 'заявок')} · ${money(sum(list))}`} onClose={onClose}>
      <p className="muted">{stage.hint}</p>
      {stage.id === 'act_signed' && list.length > 0 && (
        <button className="btn primary block-btn" onClick={invoiceAll}><Receipt size={16} /> Выставить все счета — {money(sum(list))}</button>
      )}
      {!list.length && <Empty>Здесь пусто — деньги на этом шаге не застревают.</Empty>}
      <ul className="stage-list">
        {list.map((r) => {
          const age = ageOnStage(r, state.clock)
          return (
            <li key={r.id}>
              <button className="stage-item" onClick={() => open(r.id)}>
                <span className="grow">
                  <b>{client(r.clientId).name}</b>
                  <span className="muted small">№{r.id} · {r.problem}</span>
                </span>
                <span className="right">
                  <b>{money(amount(r))}</b>
                  <Badge tone={age > 30 ? 'red' : age > 7 ? 'amber' : 'gray'}>{age ? `${age} дн.` : 'сегодня'}</Badge>
                </span>
                <ChevronRight size={16} className="muted" />
              </button>
              {stage.id === 'done' && (
                <button className="link small" onClick={() => { dispatch({ type: 'remindEngineer', id: r.id }); toast('Напоминание инженеру отправлено') }}>
                  <Bell size={13} /> Напомнить инженеру
                </button>
              )}
              {stage.id === 'invoiced' && (
                <button className="link small" onClick={() => { dispatch({ type: 'remindClient', id: r.id }); toast(`Напоминание отправлено: ${client(r.clientId).name}`) }}>
                  <Bell size={13} /> Напомнить клиенту{r.reminders ? ` (отправлено: ${r.reminders})` : ''}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </Drawer>
  )
}

function Chart({ months }) {
  const W = 620, H = 230, left = 44, bottom = 28, top = 18
  const max = 4500000
  const y = (v) => top + (H - top - bottom) * (1 - v / max)
  const slot = (W - left) / months.length
  const bw = Math.min(26, slot / 3.2)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Начислено и получено по месяцам">
      {[0, 1, 2, 3, 4].map((m) => (
        <g key={m}>
          <line x1={left} x2={W} y1={y(m * 1e6)} y2={y(m * 1e6)} className="grid" />
          <text x={left - 8} y={y(m * 1e6) + 4} className="axis" textAnchor="end">{m ? `${m} млн` : '0'}</text>
        </g>
      ))}
      {months.map((d, i) => {
        const cx = left + slot * i + slot / 2
        const last = i === months.length - 1
        return (
          <g key={d.month}>
            <rect x={cx - bw - 2} y={y(d.accrued)} width={bw} height={y(0) - y(d.accrued)} rx="4" className="bar-accrued" opacity={last ? 0.75 : 1}>
              <title>{`${d.month}: начислено ${money(d.accrued)}`}</title>
            </rect>
            <rect x={cx + 2} y={y(d.received)} width={bw} height={y(0) - y(d.received)} rx="4" className="bar-received" opacity={last ? 0.75 : 1}>
              <title>{`${d.month}: получено ${money(d.received)}`}</title>
            </rect>
            <text x={cx} y={H - 8} className="axis" textAnchor="middle">{d.month}{last ? '*' : ''}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Manager() {
  const { state } = useStore()
  const [stageOpen, setStageOpen] = useState(null)
  const [reqOpen, setReqOpen] = useState(null)
  const now = state.clock
  const by = (s) => state.requests.filter((r) => r.status === s)

  const stuck = STAGES.reduce((s, st) => s + sum(by(st.id)), 0)
  const paidSept = state.requests.filter((r) => r.paidAt?.startsWith('2026-09'))
  const accruedSept = state.requests.filter((r) => r.act?.signedAt.startsWith('2026-09'))
  const months = [...HISTORY, { month: 'Сен', accrued: SEPT_BASE.accrued + sum(accruedSept), received: SEPT_BASE.received + sum(paidSept) }]
  // сколько дней проходит от выполненной работы до денег на счёте — по оплаченным заявкам
  const paidAll = by('paid')
  const cycleDays = Math.round(paidAll.reduce((s, r) => s + daysBetween(doneAt(r), r.paidAt), 0) / Math.max(1, paidAll.length))
  const gap = months.reduce((s, m) => s + m.accrued - m.received, 0)
  const growth = Math.round((months[4].accrued / months[0].accrued - 1) * 100)

  // дебиторка по клиентам и «возрасту» долга от даты счёта
  const debts = {}
  for (const r of by('invoiced')) {
    const d = (debts[r.clientId] ??= { clientId: r.clientId, fresh: 0, mid: 0, old: 0 })
    const age = daysBetween(r.invoice.date, now)
    d[age <= 30 ? 'fresh' : age <= 60 ? 'mid' : 'old'] += amount(r)
  }
  const debtRows = Object.values(debts).map((d) => ({ ...d, total: d.fresh + d.mid + d.old })).sort((a, b) => b.total - a.total)
  const maxDebt = Math.max(1, ...debtRows.map((d) => d.total))
  const overdue30 = by('invoiced').filter((r) => daysBetween(r.invoice.date, now) > 30)

  const alerts = [
    ...state.requests.filter((r) => isOverdue(r, now)).map((r) => ({ id: r.id, tone: 'red', icon: TriangleAlert,
      text: `${client(r.clientId).name}: срок реакции по договору нарушен на ${fmtHours(slaLeft(r, now))}` })),
    ...by('done').filter((r) => ageOnStage(r, now) >= 5).map((r) => ({ id: r.id, tone: 'amber', icon: Receipt,
      text: `№${r.id} выполнена ${ageOnStage(r, now)} дн. назад, акта нет — ${money(amount(r))}` })),
    ...by('invoiced').filter((r) => daysBetween(addDaysIso(r.invoice.date, client(r.clientId).payDays), now) > 30).map((r) => ({ id: r.id, tone: 'red', icon: Bell,
      text: `${client(r.clientId).name} не платит ${daysBetween(r.invoice.date, now)} дн. — ${money(amount(r))}` })),
  ]
  const lowStock = state.parts.filter((p) => p.stock < p.min)

  const team = ENGINEERS.map((e) => {
    const mine = state.requests.filter((r) => r.engineerId === e.id)
    const noAct = mine.filter((r) => r.status === 'done')
    return { ...e, inWork: mine.filter((r) => ['assigned', 'in_progress'].includes(r.status)).length,
      closed: mine.filter((r) => r.act?.signedAt.startsWith('2026-09')).length, noAct: noAct.length, noActSum: sum(noAct) }
  })

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1>Где деньги</h1>
          <p className="muted">Руслан, вот что происходит с деньгами сервиса на сегодня, {fmtDate(now)}.</p>
        </div>
      </div>

      <section className="hero" data-tour="hero">
        <div className="hero-main">
          <span className="hero-label">Заработано, но ещё не на счёте</span>
          <div className="hero-sum">{money(stuck)}</div>
          <span className="muted">Это деньги за уже сделанную работу, которые застряли между выездом и оплатой</span>
        </div>
        <div className="hero-side">
          <div><span className="muted small">От работы до оплаты, в среднем</span><b>{plural(cycleDays, 'день', 'дня', 'дней')}</b></div>
          <div><span className="muted small">Долги старше 30 дней</span><b className="text-red">{money(sum(overdue30))}</b></div>
        </div>
      </section>

      <section className="stages" data-tour="stages">
        {STAGES.map((st, i) => {
          const list = by(st.id)
          const oldest = Math.max(0, ...list.map((r) => ageOnStage(r, now)))
          return (
            <div className="stage-wrap" key={st.id}>
              <button className={`stage ${st.tone}`} onClick={() => setStageOpen(st)}>
                <span className="stage-step">Шаг {i + 1}</span>
                <span className="stage-title">{st.title}, <b>{st.sub}</b></span>
                <span className="stage-sum">{money(sum(list))}</span>
                <span className="muted small">{plural(list.length, 'заявка', 'заявки', 'заявок')}{list.length ? ` · самой старой ${oldest} дн.` : ''}</span>
                <span className="stage-cta">Открыть <ChevronRight size={14} /></span>
              </button>
              <ArrowRight className="stage-arrow" size={18} />
            </div>
          )
        })}
        <div className="stage ok static">
          <span className="stage-step">Итог</span>
          <span className="stage-title">Деньги <b>на счёте</b></span>
          <span className="stage-sum">{money(sum(paidSept) + SEPT_BASE.received)}</span>
          <span className="muted small">получено в сентябре</span>
        </div>
      </section>

      <div className="grid-2-1">
        <section className="panel" data-tour="chart">
          <div className="panel-head">
            <h3>Почему оборот растёт, а денег не больше</h3>
            <div className="legend"><span className="lg accrued" />Начислено <span className="lg received" />Получено</div>
          </div>
          <Chart months={months} />
          <p className="chart-note">
            <TrendingUp size={16} /> С апреля начисления выросли на <b>{growth}%</b>, а поступления почти не изменились.
            Разница за полгода — <b>{moneyShort(gap)}</b>: работа сделана, а деньги не пришли.
            <span className="muted small"> * сентябрь — по 19 число.</span>
          </p>
        </section>

        <section className="panel">
          <h3>Требует решения <span className="count">{alerts.length + lowStock.length}</span></h3>
          <ul className="alerts">
            {alerts.map((a) => (
              <li key={`${a.id}-${a.text}`}>
                <button className="alert" onClick={() => setReqOpen(a.id)}>
                  <a.icon size={16} className={`text-${a.tone}`} /><span>{a.text}</span>
                </button>
              </li>
            ))}
            {lowStock.map((p) => (
              <li key={p.id}><div className="alert static"><Package size={16} className="text-amber" />
                <span>На складе заканчивается: {p.name} — {p.stock} шт. (минимум {p.min})</span></div></li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <h3>Кто сколько должен</h3>
            <div className="legend"><span className="lg fresh" />до 30 дн. <span className="lg mid" />31–60 <span className="lg old" />60+</div>
          </div>
          <ul className="debts">
            {debtRows.map((d) => (
              <li key={d.clientId}>
                <div className="row between"><span>{client(d.clientId).name}</span><b>{money(d.total)}</b></div>
                <div className="debt-bar" style={{ width: `${(d.total / maxDebt) * 100}%` }}>
                  {d.fresh > 0 && <span className="fresh" style={{ flex: d.fresh }} />}
                  {d.mid > 0 && <span className="mid" style={{ flex: d.mid }} />}
                  {d.old > 0 && <span className="old" style={{ flex: d.old }} />}
                </div>
              </li>
            ))}
            {!debtRows.length && <Empty>Все счета оплачены.</Empty>}
          </ul>
        </section>

        <section className="panel">
          <h3>Команда сервиса</h3>
          <table className="team">
            <thead><tr><th>Инженер</th><th className="num">В работе</th><th className="num">Актов в сент.</th><th className="num">Без акта</th></tr></thead>
            <tbody>
              {team.map((e) => (
                <tr key={e.id}>
                  <td><span className="row gap-s"><Avatar id={e.id} size={24} />{e.name}</span></td>
                  <td className="num">{e.inWork}</td>
                  <td className="num">{e.closed}</td>
                  <td className="num">{e.noAct ? <Badge tone={e.noAct >= 3 ? 'red' : 'amber'}>{e.noAct} · {moneyShort(e.noActSum)}</Badge> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted small">«Без акта» — работа сделана, но не закрыта актом. Видно, с кем поговорить в первую очередь.</p>
        </section>
      </div>

      {stageOpen && <StageDrawer stage={stageOpen} onClose={() => setStageOpen(null)} open={(id) => { setStageOpen(null); setReqOpen(id) }} />}
      {reqOpen && <RequestDrawer id={reqOpen} role="manager" onClose={() => setReqOpen(null)} />}
    </div>
  )
}
