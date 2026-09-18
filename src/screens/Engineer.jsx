import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft, Camera, CircleCheckBig, Eraser, FilePen, MapPin, Minus, Navigation, Phone, Plus, Search, ShieldCheck, X,
} from 'lucide-react'
import { ENGINEERS, WORKS } from '../data'
import { amount, client, equipment, fmtDate, money, plural, slaLeft, underWarranty, useStore } from '../store'
import { Avatar, Badge, SlaBadge } from '../ui'

// ---------- подпись пальцем ----------
function SignaturePad({ onChange }) {
  const ref = useRef(null)
  const drawing = useRef(false)
  useEffect(() => {
    const c = ref.current
    const ratio = window.devicePixelRatio || 1
    c.width = c.offsetWidth * ratio
    c.height = c.offsetHeight * ratio
    const ctx = c.getContext('2d')
    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1e3a8a'
  }, [])
  const pos = (e) => {
    const r = ref.current.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }
  const down = (e) => {
    drawing.current = true
    ref.current.setPointerCapture(e.pointerId)
    const ctx = ref.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(...pos(e))
  }
  const move = (e) => {
    if (!drawing.current) return
    const ctx = ref.current.getContext('2d')
    ctx.lineTo(...pos(e))
    ctx.stroke()
  }
  const up = () => {
    if (!drawing.current) return
    drawing.current = false
    onChange(ref.current.toDataURL('image/png'))
  }
  const clear = () => {
    const c = ref.current
    c.getContext('2d').clearRect(0, 0, c.width, c.height)
    onChange(null)
  }
  return (
    <div className="sign-wrap">
      <canvas ref={ref} className="sign-pad" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} aria-label="Поле для подписи" />
      <span className="sign-line">Подпись клиента</span>
      <button className="p-link" onClick={clear}><Eraser size={14} /> Очистить</button>
    </div>
  )
}

// ---------- экраны внутри телефона ----------
function JobList({ engineerId, open }) {
  const { state } = useStore()
  const mine = state.requests.filter((r) => r.engineerId === engineerId)
  const today = mine.filter((r) => ['assigned', 'in_progress'].includes(r.status))
    .sort((a, b) => (a.status === 'in_progress' ? -1 : 0) - (b.status === 'in_progress' ? -1 : 0) || slaLeft(a, state.clock) - slaLeft(b, state.clock))
  const noAct = mine.filter((r) => r.status === 'done')
  const e = ENGINEERS.find((x) => x.id === engineerId)
  return (
    <div className="p-screen">
      <div className="p-hello">
        <span className="muted small">{fmtDate(state.clock)}, пятница</span>
        <h2>Привет, {e.short}!</h2>
        <span className="muted">{today.length ? plural(today.length, 'заявка', 'заявки', 'заявок') + ' на сегодня' : 'На сегодня заявок нет'}</span>
      </div>
      {today.map((r) => (
        <button key={r.id} className="p-card" onClick={() => open(r.id)}>
          <span className="row between"><b>{client(r.clientId).name}</b>{r.status === 'in_progress' ? <Badge tone="amber">В работе</Badge> : <SlaBadge r={r} />}</span>
          <span className="small">{r.problem}</span>
          <span className="muted small row gap-xs"><MapPin size={13} /> {client(r.clientId).address}</span>
        </button>
      ))}
      {noAct.length > 0 && (
        <>
          <div className="p-section warn">Работа сделана — возьмите подпись акта</div>
          {noAct.map((r) => (
            <button key={r.id} className="p-card warn" onClick={() => open(r.id)}>
              <span className="row between"><b>{client(r.clientId).name}</b><b>{money(amount(r))}</b></span>
              <span className="small">№{r.id} · {r.problem}</span>
            </button>
          ))}
        </>
      )}
    </div>
  )
}

function PartPicker({ r }) {
  const { state, dispatch, toast } = useStore()
  const [q, setQ] = useState('')
  const [qty, setQty] = useState({})
  const [error, setError] = useState('')
  const found = state.parts.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 4)
  const issue = (p) => {
    const n = qty[p.id] ?? 1
    if (n > p.stock) { setError(`${p.name}: на складе только ${p.stock} шт.`); return }
    setError('')
    dispatch({ type: 'issuePart', id: r.id, partId: p.id, qty: n })
    toast(`Со склада списано: ${p.name} × ${n}. Добавлено в акт`)
    setQ('')
  }
  return (
    <div className="p-block">
      <div className="row between"><h4>Запчасти со склада</h4><Badge tone="teal">Новое в 0.2: поиск</Badge></div>
      {r.parts.map((p) => <div key={p.partId} className="p-line"><span>{p.name} × {p.qty}</span><span>{money(p.price * p.qty)}</span></div>)}
      <label className="p-search"><Search size={15} /><input placeholder="Найти: ТЭН, помпа, фильтр…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      {q.trim() && found.map((p) => (
        <div key={p.id} className="p-part">
          <span className="grow"><b className="small">{p.name}</b><span className={`small ${p.stock < p.min ? 'text-amber' : 'muted'}`}>на складе {p.stock} · {money(p.price)}</span></span>
          <span className="stepper">
            <button onClick={() => setQty({ ...qty, [p.id]: Math.max(1, (qty[p.id] ?? 1) - 1) })} aria-label="Меньше"><Minus size={13} /></button>
            <span>{qty[p.id] ?? 1}</span>
            <button onClick={() => setQty({ ...qty, [p.id]: (qty[p.id] ?? 1) + 1 })} aria-label="Больше"><Plus size={13} /></button>
          </span>
          <button className="p-btn small-btn" disabled={p.stock === 0} onClick={() => issue(p)}>Выдать</button>
        </div>
      ))}
      {error && <div className="p-error">{error}</div>}
      <span className="muted tiny">Запчасть выдаётся только под заявку и сразу попадает в акт.</span>
    </div>
  )
}

function Job({ id, back, toAct }) {
  const { state, dispatch, toast } = useStore()
  const r = state.requests.find((x) => x.id === id)
  const [photos, setPhotos] = useState(0)
  const c = client(r.clientId)
  const q = equipment(r)
  const editable = r.status === 'in_progress'
  return (
    <div className="p-screen with-bar">
      <button className="p-back" onClick={back}><ArrowLeft size={16} /> Мои заявки</button>
      <div className="p-block">
        <span className="muted small">№{r.id}</span>
        <h3>{c.name}</h3>
        <p className="small">«{r.problem}»</p>
        <div className="row gap-s">
          <button className="p-chip" onClick={() => toast(`Звонок: ${c.contact.split(',')[0]}, ${c.phone}`)}><Phone size={14} /> Позвонить</button>
          <button className="p-chip" onClick={() => toast(`Маршрут до ${c.address} открыт в 2ГИС`)}><Navigation size={14} /> Маршрут</button>
        </div>
      </div>
      <div className="p-block">
        <div className="small"><b>{q.model}</b></div>
        <div className="muted small">№ {q.serial}</div>
        {underWarranty(q, state.clock) ? <Badge tone="green" icon={ShieldCheck}>На гарантии до {fmtDate(q.warranty)}</Badge> : <Badge>Гарантия закончилась</Badge>}
      </div>

      {r.status === 'assigned' && (
        <button className="p-btn big" onClick={() => { dispatch({ type: 'start', id: r.id }); toast('Диспетчер видит: вы на месте') }}>Я на месте — начать работу</button>
      )}

      {(editable || r.status === 'done') && (
        <>
          <div className="p-block">
            <h4>Выполненные работы</h4>
            {r.works.map((w, i) => (
              <div key={i} className="p-line">
                <span>{w.name}</span>
                <span className="row gap-xs">{money(w.price)}
                  {editable && <button className="p-x" onClick={() => dispatch({ type: 'removeWork', id: r.id, index: i })} aria-label="Убрать"><X size={13} /></button>}
                </span>
              </div>
            ))}
            {editable && (
              <div className="p-chips">
                {WORKS.map((w) => <button key={w.id} className="p-chip" onClick={() => dispatch({ type: 'addWork', id: r.id, work: w })}><Plus size={12} /> {w.name}</button>)}
              </div>
            )}
          </div>
          {editable && <PartPicker r={r} />}
          {editable && (
            <div className="p-block">
              <h4>Фото до и после</h4>
              <div className="p-photos">
                {Array.from({ length: photos }, (_, i) => <div key={i} className="p-photo done"><CircleCheckBig size={18} /></div>)}
                {photos < 3 && <button className="p-photo" onClick={() => setPhotos(photos + 1)} aria-label="Добавить фото"><Camera size={18} /></button>}
              </div>
            </div>
          )}
          <div className="p-bar">
            <span><span className="muted tiny">Итого по акту</span><b>{money(amount(r))}</b></span>
            <button className="p-btn" disabled={!r.works.length} onClick={toAct}><FilePen size={16} /> Акт</button>
          </div>
        </>
      )}
    </div>
  )
}

function Act({ id, back, done }) {
  const { state, dispatch, toast } = useStore()
  const r = state.requests.find((x) => x.id === id)
  const c = client(r.clientId)
  const [signer, setSigner] = useState(c.contact.split(',')[0])
  const [signature, setSignature] = useState(null)
  const sign = () => {
    if (r.status === 'in_progress') dispatch({ type: 'complete', id: r.id })
    dispatch({ type: 'signAct', id: r.id, signer, signature })
    toast(`Акт А-${r.id} подписан и отправлен клиенту и в бухгалтерию`)
    done()
  }
  return (
    <div className="p-screen">
      <button className="p-back" onClick={back}><ArrowLeft size={16} /> Назад к заявке</button>
      <div className="p-act">
        <div className="row between"><b>Акт выполненных работ</b><span className="muted small">А-{r.id}</span></div>
        <div className="muted small">{fmtDate(state.clock)} · ТОО «Ортеко» → {c.name}</div>
        <div className="small">{equipment(r).model}</div>
        <div className="p-act-lines">
          {r.works.map((w, i) => <div key={i} className="p-line"><span>{w.name}</span><span>{money(w.price)}</span></div>)}
          {r.parts.map((p) => <div key={p.partId} className="p-line"><span>{p.name} × {p.qty}</span><span>{money(p.price * p.qty)}</span></div>)}
          <div className="p-line total"><span>Итого</span><span>{money(amount(r))}</span></div>
        </div>
      </div>
      <label className="p-field"><span className="muted small">Кто подписывает</span><input value={signer} onChange={(e) => setSigner(e.target.value)} /></label>
      <SignaturePad onChange={setSignature} />
      <button className="p-btn big" disabled={!signature || !signer.trim()} onClick={sign}>Подписать и отправить</button>
      <span className="muted tiny center">Клиент получит акт в WhatsApp, бухгалтерия — сразу в систему.</span>
    </div>
  )
}

function Done({ id, back }) {
  const { state } = useStore()
  const r = state.requests.find((x) => x.id === id)
  return (
    <div className="p-screen p-done">
      <CircleCheckBig size={56} className="text-green" />
      <h2>Акт подписан</h2>
      <p>{client(r.clientId).name} · {money(amount(r))}</p>
      <p className="muted small">Владелец уже видит эту сумму в шаге «Акт подписан — счёта нет». Бумага не потеряется по дороге в офис.</p>
      <button className="p-btn big" onClick={back}>К моим заявкам</button>
    </div>
  )
}

export default function Engineer() {
  const [engineerId, setEngineerId] = useState('e3')
  const [view, setView] = useState({ name: 'list' })
  const { state } = useStore()
  const go = (name, id) => setView({ name, id })
  const phoneRef = useRef(null)
  useEffect(() => { phoneRef.current?.scrollTo(0, 0) }, [view])

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1>Телефон инженера</h1>
          <p className="muted">Так инженер видит свой день. Всё, что он отмечает здесь, сразу видят диспетчер и владелец.</p>
        </div>
      </div>
      <div className="engineer-layout">
        <div className="phone-col">
          <div className="segmented eng-switch" aria-label="Инженер">
            {ENGINEERS.map((e) => (
              <button key={e.id} className={engineerId === e.id ? 'on' : ''} onClick={() => { setEngineerId(e.id); go('list') }}>
                <Avatar id={e.id} size={20} /> {e.short}
              </button>
            ))}
          </div>
          <div className="phone" data-tour="phone">
            <div className="phone-notch" />
            <div className="phone-status"><span>10:30</span><span>Ортеко Сервис</span><span>5G</span></div>
            <div className="phone-body" ref={phoneRef}>
              {view.name === 'list' && <JobList engineerId={engineerId} open={(id) => go('job', id)} />}
              {view.name === 'job' && <Job id={view.id} back={() => go('list')} toAct={() => go('act', view.id)} />}
              {view.name === 'act' && <Act id={view.id} back={() => go('job', view.id)} done={() => go('done', view.id)} />}
              {view.name === 'done' && <Done id={view.id} back={() => go('list')} />}
            </div>
          </div>
        </div>

        <aside className="side">
          <section className="panel">
            <h3>Что меняется</h3>
            <ul className="benefits">
              <li><b>Акт подписывается на месте.</b> Не нужно везти бумагу в офис — она не теряется и не лежит неделю в машине.</li>
              <li><b>Запчасть нельзя «просто взять».</b> Она списывается со склада под конкретную заявку и сама попадает в акт и счёт.</li>
              <li><b>Диспетчер видит, где инженер.</b> Кнопка «Я на месте» — и не нужно звонить с вопросом «ты где?».</li>
              <li><b>Владелец видит деньги сразу.</b> Подписанный акт за секунду появляется на экране «Где деньги».</li>
            </ul>
          </section>
          <section className="panel">
            <h3>Склад сейчас</h3>
            <table className="stock">
              <tbody>
                {state.parts.map((p) => (
                  <tr key={p.id}><td>{p.name}</td><td className={`num ${p.stock < p.min ? 'text-amber' : ''}`}><b>{p.stock}</b> <span className="muted small">/ мин. {p.min}</span></td></tr>
                ))}
              </tbody>
            </table>
          </section>
        </aside>
      </div>
    </div>
  )
}
