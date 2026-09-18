import { useState } from 'react'
import { Bell, Banknote, MapPin, Phone, Receipt, ShieldAlert, ShieldCheck, Wrench } from 'lucide-react'
import { ENGINEERS } from './data'
import {
  addDaysIso, amount, client, daysBetween, engineer, equipment, fmtDate, fmtDateTime, money, underWarranty, useStore,
} from './store'
import { Avatar, Badge, ChannelIcon, Drawer, SlaBadge, StatusBadge } from './ui'

const FLOW = ['new', 'assigned', 'in_progress', 'done', 'act_signed', 'invoiced', 'paid']
const FLOW_SHORT = ['Новая', 'Назначена', 'В работе', 'Выполнена', 'Акт', 'Счёт', 'Оплата']

export function Flow({ status }) {
  const step = FLOW.indexOf(status)
  return (
    <ol className="flow" aria-label="Путь заявки">
      {FLOW_SHORT.map((label, i) => (
        <li key={label} className={i < step ? 'passed' : i === step ? 'current' : ''}>{label}</li>
      ))}
    </ol>
  )
}

function EngineerPicker({ r }) {
  const { state, dispatch, toast } = useStore()
  const [id, setId] = useState(r.engineerId ?? '')
  const load = (eid) => state.requests.filter((x) => x.engineerId === eid && ['assigned', 'in_progress'].includes(x.status)).length
  const assign = () => {
    dispatch({ type: 'assign', id: r.id, engineerId: id })
    toast(`${engineer(id).short} получил заявку №${r.id} на телефон`)
  }
  return (
    <div className="action-box">
      <div className="action-title">Инженер</div>
      <div className="row">
        <select value={id} onChange={(e) => setId(e.target.value)} className="grow" aria-label="Инженер">
          <option value="">Выберите инженера…</option>
          {ENGINEERS.map((e) => <option key={e.id} value={e.id}>{e.name} — в работе {load(e.id)}</option>)}
        </select>
        <button className="btn primary" disabled={!id || id === r.engineerId} onClick={assign}>
          {r.engineerId ? 'Переназначить' : 'Назначить'}
        </button>
      </div>
    </div>
  )
}

function ManagerActions({ r }) {
  const { state, dispatch, toast } = useStore()
  const c = client(r.clientId)
  if (r.status === 'done') {
    const days = daysBetween(r.history.find((h) => h.text === 'Работа выполнена')?.at ?? r.createdAt, state.clock)
    return (
      <div className="action-box warn">
        <p><b>Работа сделана {days > 0 ? `${days} дн. назад` : 'сегодня'}, но акта нет.</b> Без подписанного акта нельзя выставить счёт — {money(amount(r))} не превратятся в деньги.</p>
        <button className="btn" onClick={() => { dispatch({ type: 'remindEngineer', id: r.id }); toast(`Напоминание отправлено: ${engineer(r.engineerId)?.short}`) }}>
          <Bell size={16} /> Напомнить инженеру
        </button>
      </div>
    )
  }
  if (r.status === 'act_signed') {
    return (
      <div className="action-box">
        <p>Акт подписан — счёт формируется из него одной кнопкой, сумма уже посчитана.</p>
        <button className="btn primary" onClick={() => { dispatch({ type: 'invoice', ids: [r.id] }); toast(`Счёт С-${r.id} на ${money(amount(r))} отправлен клиенту`) }}>
          <Receipt size={16} /> Выставить счёт на {money(amount(r))}
        </button>
      </div>
    )
  }
  if (r.status === 'invoiced') {
    const due = addDaysIso(r.invoice.date, c.payDays)
    const late = daysBetween(due, state.clock)
    return (
      <div className={`action-box ${late > 0 ? 'warn' : ''}`}>
        <p>{late > 0 ? <><b>Оплата просрочена на {late} дн.</b> Срок был {fmtDate(due)}.</> : <>Срок оплаты по договору — {fmtDate(due)}.</>}
          {r.reminders > 0 && ` Напоминаний отправлено: ${r.reminders}.`}</p>
        <div className="row">
          <button className="btn" onClick={() => { dispatch({ type: 'remindClient', id: r.id }); toast(`Напоминание отправлено: ${c.contact.split(',')[0]}, WhatsApp`) }}>
            <Bell size={16} /> Напомнить клиенту
          </button>
          <button className="btn primary" onClick={() => { dispatch({ type: 'pay', id: r.id }); toast(`Оплата ${money(amount(r))} от ${c.name} учтена`) }}>
            <Banknote size={16} /> Отметить оплату
          </button>
        </div>
      </div>
    )
  }
  return null
}

export default function RequestDrawer({ id, role, onClose }) {
  const { state } = useStore()
  const r = state.requests.find((x) => x.id === id)
  if (!r) return null
  const c = client(r.clientId)
  const q = equipment(r)
  const warranty = underWarranty(q, state.clock)
  const canAssign = role === 'dispatcher' && ['new', 'assigned', 'in_progress'].includes(r.status)

  return (
    <Drawer title={`Заявка №${r.id}`} subtitle={c.name} onClose={onClose}>
      <div className="row wrap gap-s">
        <StatusBadge status={r.status} />
        <SlaBadge r={r} />
        {r.priority === 'high' && <Badge tone="red">Срочно</Badge>}
        <Badge><ChannelIcon channel={r.channel} /> {{ call: 'Звонок', whatsapp: 'WhatsApp', email: 'Почта' }[r.channel]}</Badge>
      </div>
      <Flow status={r.status} />

      <section className="block">
        <p className="problem">«{r.problem}»</p>
        <div className="kv">
          <span><Wrench size={15} /> {q?.model} · № {q?.serial}</span>
          <span>{warranty
            ? <Badge tone="green" icon={ShieldCheck}>На гарантии до {fmtDate(q.warranty)}</Badge>
            : <Badge tone="gray" icon={ShieldAlert}>Гарантия закончилась {fmtDate(q?.warranty)} — работы платные</Badge>}</span>
          <span><MapPin size={15} /> {c.address}</span>
          <span><Phone size={15} /> {c.contact} · {c.phone}</span>
          <span className="muted">Договор: {c.contract.type}{c.contract.fee ? ` ${money(c.contract.fee)}/мес` : ''} · реакция {c.contract.sla} ч · оплата {c.payDays} дн.</span>
        </div>
      </section>

      {canAssign && <EngineerPicker r={r} />}
      {role === 'manager' && <ManagerActions r={r} />}

      {r.engineerId && !canAssign && (
        <div className="row gap-s engineer-line"><Avatar id={r.engineerId} /> {engineer(r.engineerId).name}</div>
      )}

      {(r.works.length > 0 || r.parts.length > 0) && (
        <section className="block">
          <h3>Работы и запчасти</h3>
          <table className="lines">
            <tbody>
              {r.works.map((w, i) => <tr key={`w${i}`}><td>{w.name}</td><td className="num">{money(w.price)}</td></tr>)}
              {r.parts.map((p) => <tr key={p.partId}><td>{p.name} × {p.qty}</td><td className="num">{money(p.price * p.qty)}</td></tr>)}
              <tr className="total"><td>Итого</td><td className="num">{money(amount(r))}</td></tr>
            </tbody>
          </table>
        </section>
      )}

      {r.act && (
        <section className="block">
          <h3>Акт {r.act.number}</h3>
          <div className="act">
            <div>Подписал: <b>{r.act.signer}</b>, {fmtDateTime(r.act.signedAt)}</div>
            {r.act.signature
              ? <img src={r.act.signature} alt="Подпись клиента" className="signature-img" />
              : <div className="muted small">Подпись на бумажном акте, скан в архиве</div>}
            {r.invoice && <div>Счёт {r.invoice.number} от {fmtDate(r.invoice.date)}{r.paidAt && <> · оплачен {fmtDate(r.paidAt)}</>}</div>}
          </div>
        </section>
      )}

      <section className="block">
        <h3>История</h3>
        <ol className="timeline">
          {[...r.history].reverse().map((h, i) => (
            <li key={i}><span className="t-when">{fmtDateTime(h.at)}</span><span>{h.text}</span><span className="muted small">{h.who}</span></li>
          ))}
        </ol>
      </section>
    </Drawer>
  )
}
