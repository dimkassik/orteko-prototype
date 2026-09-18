import { useEffect, useReducer, useState } from 'react'
import { clients, ENGINEERS, initialState, STATUSES, TODAY, WORKS } from './data'

// ---------- помощники ----------
const money = (v) => `${Math.round(v).toLocaleString('ru-RU')} ₸`
const clientName = (id) => clients.find((c) => c.id === id)?.name ?? '—'
const statusLabel = (id) => STATUSES.find((s) => s.id === id)?.label
const amount = (r) =>
  r.works.reduce((s, w) => s + w.price, 0) + r.parts.reduce((s, p) => s + p.price * p.qty, 0)
const daysBetween = (from, to) => Math.round((new Date(to) - new Date(from)) / 86400000)
const fmtDate = (d) => (d ? d.split('-').reverse().join('.') : '—')
const isOverdue = (r) => ['new', 'assigned', 'in_progress'].includes(r.status) && r.due < TODAY
const sum = (list) => list.reduce((s, r) => s + amount(r), 0)

// ---------- состояние (сохраняется в браузере, чтобы демо переживало перезагрузку) ----------
const STORAGE_KEY = 'orteko-demo-v1'
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* нет доступа к хранилищу — начинаем с демо-данных */ }
  return initialState
}

function reducer(state, action) {
  const update = (id, fn) => ({ ...state, requests: state.requests.map((r) => (r.id === id ? fn(r) : r)) })
  switch (action.type) {
    case 'assign': return update(action.id, (r) => ({ ...r, engineer: action.engineer, status: 'assigned' }))
    case 'start': return update(action.id, (r) => ({ ...r, status: 'in_progress' }))
    case 'addWork': return update(action.id, (r) => ({ ...r, works: [...r.works, action.work] }))
    case 'issuePart': {
      // запчасть выдаётся со склада только под заявку и сразу попадает в акт
      const part = state.parts.find((p) => p.id === action.partId)
      const next = update(action.id, (r) => {
        const existing = r.parts.find((p) => p.partId === part.id)
        const parts = existing
          ? r.parts.map((p) => (p.partId === part.id ? { ...p, qty: p.qty + action.qty } : p))
          : [...r.parts, { partId: part.id, name: part.name, qty: action.qty, price: part.price }]
        return { ...r, parts }
      })
      return { ...next, parts: state.parts.map((p) => (p.id === part.id ? { ...p, stock: p.stock - action.qty } : p)) }
    }
    case 'done': return update(action.id, (r) => ({ ...r, status: 'done' }))
    case 'signAct': return update(action.id, (r) => ({ ...r, status: 'act_signed' }))
    case 'invoice': return update(action.id, (r) => ({ ...r, status: 'invoiced', invoiceDate: TODAY }))
    case 'pay': return update(action.id, (r) => ({ ...r, status: 'paid', paidDate: TODAY }))
    case 'create': {
      const r = { id: state.nextId, clientId: action.clientId, equipment: action.equipment, problem: action.problem,
        engineer: null, created: TODAY, due: '2026-09-20', status: 'new', works: [], parts: [] }
      return { ...state, requests: [r, ...state.requests], nextId: state.nextId + 1 }
    }
    case 'reset': return initialState
    default: return state
  }
}

// ---------- экран 1: «Где деньги» ----------
function Dashboard({ state, open }) {
  const by = (status) => state.requests.filter((r) => r.status === status)
  const noAct = by('done')
  const noInvoice = by('act_signed')
  const unpaid = by('invoiced')
  const paidThisMonth = by('paid').filter((r) => r.paidDate?.startsWith('2026-09'))
  const stuck = sum(noAct) + sum(noInvoice) + sum(unpaid)

  const stages = [
    { label: 'Работа сделана, акта нет', list: noAct, color: 'var(--c1)' },
    { label: 'Акт есть, счёта нет', list: noInvoice, color: 'var(--c2)' },
    { label: 'Счёт выставлен, не оплачен', list: unpaid, color: 'var(--c3)' },
  ]

  // дебиторка по клиентам и «возрасту» долга
  const debts = {}
  for (const r of unpaid) {
    const d = (debts[r.clientId] ??= { clientId: r.clientId, b30: 0, b60: 0, b90: 0 })
    const age = daysBetween(r.invoiceDate, TODAY)
    d[age <= 30 ? 'b30' : age <= 60 ? 'b60' : 'b90'] += amount(r)
  }
  const debtRows = Object.values(debts).map((d) => ({ ...d, total: d.b30 + d.b60 + d.b90 }))
    .sort((a, b) => b.total - a.total)

  const overdue = state.requests.filter(isOverdue)
  const lowStock = state.parts.filter((p) => p.stock < p.min)

  return (
    <>
      <section className="hero">
        <div>
          <span className="muted">Застряло между «работа сделана» и «деньги на счёте»</span>
          <div className="hero-sum">{money(stuck)}</div>
        </div>
        <div className="hero-side">
          <span className="muted">Получено в сентябре</span>
          <b>{money(sum(paidThisMonth))}</b>
        </div>
      </section>

      <div className="bar" aria-label="Где застряли деньги">
        {stages.map((s) => sum(s.list) > 0 && (
          <div key={s.label} style={{ flex: sum(s.list), background: s.color }} title={`${s.label}: ${money(sum(s.list))}`} />
        ))}
      </div>

      <div className="cards">
        {stages.map((s) => (
          <div className="card" key={s.label}>
            <span className="dot" style={{ background: s.color }} />
            <span className="muted">{s.label}</span>
            <b>{money(sum(s.list))}</b>
            <span className="muted small">{s.list.length} заявок</span>
          </div>
        ))}
      </div>

      <div className="grid2">
        <section className="panel">
          <h3>Кто сколько должен</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Клиент</th><th className="num">до 30 дн.</th><th className="num">31–60</th><th className="num">60+</th><th className="num">Итого</th></tr></thead>
              <tbody>
                {debtRows.map((d) => (
                  <tr key={d.clientId}>
                    <td>{clientName(d.clientId)}</td>
                    <td className="num">{d.b30 ? money(d.b30) : '—'}</td>
                    <td className="num">{d.b60 ? money(d.b60) : '—'}</td>
                    <td className={`num ${d.b90 ? 'danger' : ''}`}>{d.b90 ? money(d.b90) : '—'}</td>
                    <td className="num"><b>{money(d.total)}</b></td>
                  </tr>
                ))}
                {!debtRows.length && <tr><td colSpan="5" className="muted">Долгов нет</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h3>Требует внимания</h3>
          <ul className="alerts">
            {overdue.map((r) => (
              <li key={r.id}>
                <button className="link" onClick={() => open(r.id)}>
                  <span className="badge danger">Просрочена на {daysBetween(r.due, TODAY)} дн.</span>
                  №{r.id} · {clientName(r.clientId)} · {r.problem}
                </button>
              </li>
            ))}
            {noAct.map((r) => (
              <li key={r.id}>
                <button className="link" onClick={() => open(r.id)}>
                  <span className="badge warn">Нет акта</span>
                  №{r.id} · {clientName(r.clientId)} · {money(amount(r))}
                </button>
              </li>
            ))}
            {lowStock.map((p) => (
              <li key={p.id}><span className="badge">Склад</span>{p.name}: осталось {p.stock}, минимум {p.min}</li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}

// ---------- экран 2: заявки по шагам пути ----------
const COLUMNS = [
  { title: 'В работе', statuses: ['new', 'assigned', 'in_progress'] },
  { title: 'Выполнено — нет акта', statuses: ['done'], leak: true },
  { title: 'Акт — нет счёта', statuses: ['act_signed'], leak: true },
  { title: 'Ждём оплату', statuses: ['invoiced'], leak: true },
  { title: 'Оплачено', statuses: ['paid'] },
]

function NewRequest({ dispatch, close }) {
  const [form, setForm] = useState({ clientId: '', equipment: '', problem: '' })
  const submit = (e) => {
    e.preventDefault()
    dispatch({ type: 'create', ...form, clientId: +form.clientId })
    close()
  }
  return (
    <form className="panel row" onSubmit={submit}>
      <select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
        <option value="">Клиент…</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input required placeholder="Оборудование" value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} />
      <input required className="grow" placeholder="Что случилось" value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} />
      <button className="primary">Создать</button>
      <button type="button" onClick={close}>Отмена</button>
    </form>
  )
}

function Requests({ state, dispatch, open }) {
  const [creating, setCreating] = useState(false)
  return (
    <>
      <div className="row between">
        <p className="muted">Каждая заявка идёт слева направо. Оранжевые колонки — деньги, которые уже заработаны, но ещё не получены.</p>
        {!creating && <button className="primary" onClick={() => setCreating(true)}>+ Новая заявка</button>}
      </div>
      {creating && <NewRequest dispatch={dispatch} close={() => setCreating(false)} />}
      <div className="kanban">
        {COLUMNS.map((col) => {
          const list = state.requests.filter((r) => col.statuses.includes(r.status))
          return (
            <section key={col.title} className={`column ${col.leak ? 'leak' : ''}`}>
              <header>
                <b>{col.title}</b>
                <span className="muted small">{list.length} · {money(sum(list))}</span>
              </header>
              {list.map((r) => (
                <button key={r.id} className="ticket" onClick={() => open(r.id)}>
                  <span className="row between small">
                    <span className="muted">№{r.id} · {statusLabel(r.status)}</span>
                    {isOverdue(r) && <span className="badge danger">просрочена</span>}
                    {r.status === 'invoiced' && daysBetween(r.invoiceDate, TODAY) > 60 && <span className="badge danger">60+ дн.</span>}
                  </span>
                  <b>{clientName(r.clientId)}</b>
                  <span>{r.equipment}: {r.problem}</span>
                  <span className="row between small">
                    <span className="muted">{r.engineer ?? 'Инженер не назначен'}</span>
                    {amount(r) > 0 && <b>{money(amount(r))}</b>}
                  </span>
                </button>
              ))}
            </section>
          )
        })}
      </div>
    </>
  )
}

// ---------- экран 3: карточка заявки ----------
function RequestCard({ state, dispatch, id, back }) {
  const r = state.requests.find((x) => x.id === id)
  const [engineer, setEngineer] = useState(ENGINEERS[0])
  const [partId, setPartId] = useState('')
  const [qty, setQty] = useState(1)
  const [error, setError] = useState('')
  if (!r) return null

  const step = STATUSES.findIndex((s) => s.id === r.status)
  const editable = ['assigned', 'in_progress'].includes(r.status)

  const issue = () => {
    const part = state.parts.find((p) => p.id === +partId)
    if (!part) return
    if (part.stock < qty) { setError(`На складе только ${part.stock} шт.`); return }
    setError('')
    dispatch({ type: 'issuePart', id, partId: part.id, qty: +qty })
  }

  // следующее действие зависит от шага; подсказка объясняет, зачем оно бизнесу
  const next = {
    new: { hint: 'Назначьте инженера — заявка не должна «висеть» без ответственного.',
      el: (
        <div className="row">
          <select value={engineer} onChange={(e) => setEngineer(e.target.value)}>
            {ENGINEERS.map((e) => <option key={e}>{e}</option>)}
          </select>
          <button className="primary" onClick={() => dispatch({ type: 'assign', id, engineer })}>Назначить</button>
        </div>) },
    assigned: { hint: 'Инженер выехал к клиенту.', el: <button className="primary" onClick={() => dispatch({ type: 'start', id })}>Начать работу</button> },
    in_progress: { hint: r.works.length ? 'Отметьте работы и запчасти, затем завершите.' : 'Добавьте хотя бы одну работу — иначе нечего включить в акт.',
      el: <button className="primary" disabled={!r.works.length} onClick={() => dispatch({ type: 'done', id })}>Работа выполнена</button> },
    done: { hint: 'Без подписанного акта нельзя выставить счёт — это главная точка утечки денег.',
      el: <button className="primary" onClick={() => dispatch({ type: 'signAct', id })}>Клиент подписал акт</button> },
    act_signed: { hint: 'Счёт формируется из акта одной кнопкой — сумма уже посчитана.',
      el: <button className="primary" onClick={() => dispatch({ type: 'invoice', id })}>Выставить счёт на {money(amount(r))}</button> },
    invoiced: { hint: `Счёт выставлен ${fmtDate(r.invoiceDate)}, прошло ${daysBetween(r.invoiceDate, TODAY)} дн. Система напоминает клиенту об оплате.`,
      el: <button className="primary" onClick={() => dispatch({ type: 'pay', id })}>Отметить оплату</button> },
    paid: { hint: `Оплачено ${fmtDate(r.paidDate)}. Деньги на счёте — заявка закрыта.`, el: null },
  }[r.status]

  return (
    <>
      <button className="link" onClick={back}>← Назад</button>
      <div className="row between card-head">
        <div>
          <h2>Заявка №{r.id} · {clientName(r.clientId)}</h2>
          <span className="muted">{r.equipment} — {r.problem}</span>
        </div>
        <div className="total"><span className="muted small">Сумма по акту</span><b>{money(amount(r))}</b></div>
      </div>

      <ol className="stepper">
        {STATUSES.map((s, i) => <li key={s.id} className={i < step ? 'passed' : i === step ? 'current' : ''}>{s.label}</li>)}
      </ol>

      <section className="panel next">
        <p>{next.hint}</p>
        {next.el}
      </section>

      <div className="grid2">
        <section className="panel">
          <h3>Работы</h3>
          <table><tbody>
            {r.works.map((w, i) => <tr key={i}><td>{w.name}</td><td className="num">{money(w.price)}</td></tr>)}
            {!r.works.length && <tr><td className="muted">Пока нет</td></tr>}
          </tbody></table>
          {editable && (
            <div className="row chips">
              {WORKS.map((w) => <button key={w.name} className="chip" onClick={() => dispatch({ type: 'addWork', id, work: w })}>+ {w.name}</button>)}
            </div>
          )}
        </section>

        <section className="panel">
          <h3>Запчасти со склада</h3>
          <table><tbody>
            {r.parts.map((p) => <tr key={p.partId}><td>{p.name} × {p.qty}</td><td className="num">{money(p.price * p.qty)}</td></tr>)}
            {!r.parts.length && <tr><td className="muted">Пока нет</td></tr>}
          </tbody></table>
          {editable && (
            <div className="row">
              <select className="grow" value={partId} onChange={(e) => setPartId(e.target.value)}>
                <option value="">Запчасть…</option>
                {state.parts.map((p) => <option key={p.id} value={p.id}>{p.name} (на складе {p.stock})</option>)}
              </select>
              <input type="number" min="1" className="qty" value={qty} onChange={(e) => setQty(e.target.value)} />
              <button onClick={issue} disabled={!partId}>Выдать</button>
            </div>
          )}
          {error && <p className="danger">{error}</p>}
          <p className="muted small">Запчасть выдаётся только под заявку и сразу попадает в акт — бесплатно она уйти не может.</p>
        </section>
      </div>

      <section className="panel details">
        <span><span className="muted">Инженер:</span> {r.engineer ?? '—'}</span>
        <span><span className="muted">Создана:</span> {fmtDate(r.created)}</span>
        <span><span className="muted">Срок:</span> {fmtDate(r.due)} {isOverdue(r) && <span className="badge danger">просрочена</span>}</span>
        <span><span className="muted">Договор:</span> {clients.find((c) => c.id === r.clientId)?.contract}</span>
      </section>
    </>
  )
}

// ---------- каркас ----------
const TABS = ['Где деньги', 'Заявки']

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [tab, setTab] = useState('Где деньги')
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* демо работает и без сохранения */ }
  }, [state])

  const open = (id) => { setOpenId(id); window.scrollTo(0, 0) }

  return (
    <div className="app">
      <header className="top">
        <div className="brand"><b>Ортеко</b><span className="muted small">сервис оборудования для HoReCa · прототип</span></div>
        <nav>
          {TABS.map((t) => (
            <button key={t} className={t === tab && !openId ? 'active' : ''} onClick={() => { setTab(t); setOpenId(null) }}>{t}</button>
          ))}
        </nav>
      </header>
      <main>
        {openId
          ? <RequestCard key={openId} state={state} dispatch={dispatch} id={openId} back={() => setOpenId(null)} />
          : tab === 'Где деньги' ? <Dashboard state={state} open={open} />
          : <Requests state={state} dispatch={dispatch} open={open} />}
      </main>
      <footer className="muted small">
        Демо-данные, «сегодня» — {fmtDate(TODAY)}. Изменения сохраняются в вашем браузере.{' '}
        <button className="link" onClick={() => { dispatch({ type: 'reset' }); setOpenId(null) }}>Сбросить демо</button>
      </footer>
    </div>
  )
}
