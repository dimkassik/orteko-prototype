import { useState } from 'react'
import { Clock, Flame, Plus, Search, ShieldCheck, TriangleAlert, UserPlus } from 'lucide-react'
import { addHours, CHANNELS, CLIENTS, ENGINEERS } from '../data'
import {
  client, engineer, equipment, fmtDateTime, isOverdue, OPEN, plural, slaLeft, underWarranty, useStore,
} from '../store'
import { Avatar, Badge, ChannelIcon, Modal, SlaBadge } from '../ui'
import RequestDrawer from '../RequestDrawer'

const COLUMNS = [
  { id: 'new', title: 'Новые', hint: 'ждут инженера' },
  { id: 'assigned', title: 'Назначены', hint: 'инженер едет' },
  { id: 'in_progress', title: 'В работе', hint: 'инженер на месте' },
  { id: 'done', title: 'Ждут акта', hint: 'работа сделана' },
]

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'late', label: 'Срок нарушен' },
  { id: 'free', label: 'Без инженера' },
  { id: 'urgent', label: 'Срочные' },
]

function Ticket({ r, onOpen }) {
  const { state } = useStore()
  const c = client(r.clientId)
  const late = isOverdue(r, state.clock)
  return (
    <button className={`ticket ${late ? 'late' : ''}`} onClick={() => onOpen(r.id)} data-tour={r.id === 1087 ? 'urgent-card' : undefined}>
      <span className="row between small">
        <span className="row gap-xs muted"><ChannelIcon channel={r.channel} /> №{r.id}</span>
        {r.priority === 'high' && <Badge tone="red" icon={Flame}>Срочно</Badge>}
      </span>
      <b className="ticket-client">{c.name}</b>
      <span className="ticket-problem">{r.problem}</span>
      <span className="muted small ticket-eq">{equipment(r)?.model}</span>
      <span className="row between ticket-foot">
        {r.engineerId
          ? <span className="row gap-xs small"><Avatar id={r.engineerId} size={22} />{engineer(r.engineerId).short}</span>
          : <span className="row gap-xs small text-blue"><UserPlus size={15} /> Назначить</span>}
        <SlaBadge r={r} />
      </span>
    </button>
  )
}

function NewRequest({ onClose, onCreated }) {
  const { state, dispatch, toast } = useStore()
  const [clientId, setClientId] = useState('')
  const [equipmentId, setEquipmentId] = useState('')
  const [problem, setProblem] = useState('')
  const [channel, setChannel] = useState('whatsapp')
  const [priority, setPriority] = useState('normal')
  const c = CLIENTS.find((x) => x.id === +clientId)
  const ready = c && equipmentId && problem.trim().length > 3

  const create = () => {
    const id = state.nextRequestId
    dispatch({ type: 'create', clientId: c.id, equipmentId, problem: problem.trim(), channel, channelLabel: CHANNELS[channel], priority })
    toast(`Заявка №${id} создана, клиенту ушло подтверждение в ${CHANNELS[channel]}`)
    onCreated(id)
  }

  return (
    <Modal title="Новая заявка" onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Отмена</button>
      <button className="btn primary" disabled={!ready} onClick={create}>Создать заявку</button>
    </>}>
      <label className="field">
        <span>Клиент</span>
        <select value={clientId} onChange={(e) => { setClientId(e.target.value); setEquipmentId('') }} autoFocus>
          <option value="">Выберите клиента…</option>
          {CLIENTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </label>
      {c && (
        <div className="client-card">
          <div><b>{c.kind}</b> · {c.address}</div>
          <div className="muted small">{c.contact} · {c.phone}</div>
          <div className="row gap-s">
            <Badge tone={c.contract.type === 'Абонемент' ? 'violet' : 'gray'}>{c.contract.type}</Badge>
            <Badge icon={Clock}>Реакция по договору: {c.contract.sla} ч — до {fmtDateTime(addHours(state.clock, c.contract.sla))}</Badge>
          </div>
        </div>
      )}
      {c && (
        <div className="field">
          <span>Оборудование клиента</span>
          <div className="choice-list">
            {c.equipment.map((q) => (
              <button key={q.id} className={`choice ${equipmentId === q.id ? 'on' : ''}`} onClick={() => setEquipmentId(q.id)}>
                <b>{q.model}</b>
                <span className="muted small">№ {q.serial}</span>
                {underWarranty(q, state.clock) ? <Badge tone="green" icon={ShieldCheck}>На гарантии</Badge> : <Badge>Гарантия закончилась</Badge>}
              </button>
            ))}
          </div>
        </div>
      )}
      <label className="field">
        <span>Что случилось — словами клиента</span>
        <textarea rows="3" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Например: не набирает температуру, на экране ошибка" />
      </label>
      <div className="row wrap gap-l">
        <div className="field">
          <span>Откуда пришла</span>
          <div className="segmented">
            {Object.entries(CHANNELS).map(([id, label]) => (
              <button key={id} className={channel === id ? 'on' : ''} onClick={() => setChannel(id)}><ChannelIcon channel={id} /> {label}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <span>Приоритет</span>
          <div className="segmented">
            <button className={priority === 'normal' ? 'on' : ''} onClick={() => setPriority('normal')}>Обычный</button>
            <button className={priority === 'high' ? 'on' : ''} onClick={() => setPriority('high')}><Flame size={14} /> Срочно</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function Dispatcher() {
  const { state } = useStore()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(null)
  const [creating, setCreating] = useState(false)
  const now = state.clock

  const active = state.requests.filter((r) => COLUMNS.some((c) => c.id === r.status))
  const counts = {
    free: active.filter((r) => r.status === 'new').length,
    late: active.filter((r) => isOverdue(r, now)).length,
    soon: active.filter((r) => OPEN.includes(r.status) && !isOverdue(r, now) && slaLeft(r, now) < 2).length,
    work: active.filter((r) => ['assigned', 'in_progress'].includes(r.status)).length,
  }

  const visible = active.filter((r) => {
    if (filter === 'late' && !isOverdue(r, now)) return false
    if (filter === 'free' && r.status !== 'new') return false
    if (filter === 'urgent' && r.priority !== 'high') return false
    const q = query.trim().toLowerCase()
    return !q || `${r.id} ${client(r.clientId).name} ${r.problem} ${equipment(r)?.model}`.toLowerCase().includes(q)
  }).sort((a, b) => (OPEN.includes(a.status) ? slaLeft(a, now) : 1e9) - (OPEN.includes(b.status) ? slaLeft(b, now) : 1e9))

  const channelStats = Object.keys(CHANNELS).map((ch) => ({ ch, n: state.requests.filter((r) => r.channel === ch).length }))

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1>Заявки</h1>
          <p className="muted">Айгерим, все обращения клиентов в одном месте — ни одна не потеряется в WhatsApp или блокноте.</p>
        </div>
        <button className="btn primary" onClick={() => setCreating(true)} data-tour="new-btn"><Plus size={16} /> Новая заявка</button>
      </div>

      <div className="kpis">
        <button className={`kpi ${filter === 'free' ? 'on' : ''}`} onClick={() => setFilter('free')}><span>Без инженера</span><b>{counts.free}</b></button>
        <button className={`kpi red ${filter === 'late' ? 'on' : ''}`} onClick={() => setFilter('late')}><span>Срок по договору нарушен</span><b>{counts.late}</b></button>
        <div className="kpi amber"><span>Срок истекает менее чем через 2 ч</span><b>{counts.soon}</b></div>
        <div className="kpi"><span>Заявок у инженеров</span><b>{counts.work}</b></div>
      </div>

      <div className="toolbar">
        <div className="segmented">
          {FILTERS.map((f) => <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>{f.label}</button>)}
        </div>
        <label className="search"><Search size={16} /><input placeholder="Клиент, номер, оборудование…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      </div>

      <div className="dispatch-layout">
        <div className="board" data-tour="board">
          {COLUMNS.map((col) => {
            const list = visible.filter((r) => r.status === col.id)
            return (
              <section key={col.id} className={`col ${col.id === 'done' ? 'leak' : ''}`}>
                <header><b>{col.title}</b><span className="count">{list.length}</span><span className="muted small">{col.hint}</span></header>
                {list.map((r) => <Ticket key={r.id} r={r} onOpen={setOpen} />)}
                {!list.length && <div className="col-empty">Нет заявок</div>}
              </section>
            )
          })}
        </div>

        <aside className="side">
          <section className="panel">
            <h3>Инженеры сейчас</h3>
            <ul className="engineers">
              {ENGINEERS.map((e) => {
                const jobs = state.requests.filter((r) => r.engineerId === e.id && ['assigned', 'in_progress'].includes(r.status))
                const onSite = jobs.find((r) => r.status === 'in_progress')
                return (
                  <li key={e.id}>
                    <Avatar id={e.id} size={32} />
                    <div className="grow">
                      <b>{e.name}</b>
                      <span className="muted small">{onSite ? `На месте: ${client(onSite.clientId).name}` : jobs.length ? 'В пути' : 'Свободен'}</span>
                    </div>
                    <span className={`load l${Math.min(jobs.length, 3)}`}>{plural(jobs.length, 'заявка', 'заявки', 'заявок')}</span>
                  </li>
                )
              })}
            </ul>
          </section>
          <section className="panel">
            <h3>Откуда приходят заявки</h3>
            <ul className="channels">
              {channelStats.map(({ ch, n }) => (
                <li key={ch}><ChannelIcon channel={ch} size={16} /><span className="grow">{CHANNELS[ch]}</span><b>{n}</b></li>
              ))}
            </ul>
            <p className="muted small">Раньше заявки из WhatsApp терялись в личных телефонах. Теперь каждая попадает на доску.</p>
          </section>
          {counts.late > 0 && (
            <div className="side-alert"><TriangleAlert size={16} /> {plural(counts.late, 'заявка', 'заявки', 'заявок')} с нарушенным сроком. Клиенты на абонементе ждут не дольше 4 часов.</div>
          )}
        </aside>
      </div>

      {creating && <NewRequest onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setOpen(id) }} />}
      {open && <RequestDrawer id={open} role="dispatcher" onClose={() => setOpen(null)} />}
    </div>
  )
}

