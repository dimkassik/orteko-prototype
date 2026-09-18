import { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react'
import { addHours, CLIENTS, ENGINEERS, initialState, NOW } from './data'

// ---------- форматирование ----------
export const money = (v) => `${Math.round(v).toLocaleString('ru-RU')} ₸`
export const moneyShort = (v) =>
  v >= 1e6 ? `${(v / 1e6).toFixed(v >= 1e7 ? 1 : 2).replace('.', ',')} млн ₸` : `${Math.round(v / 1000)} тыс. ₸`
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
export const fmtDate = (iso) => {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${+d} ${MONTHS[+m - 1]}${y !== '2026' ? ` ${y}` : ''}`
}
export const fmtDateTime = (iso) => (iso ? `${fmtDate(iso)}, ${iso.slice(11, 16)}` : '—')
export const addDaysIso = (date, days) => addHours(`${date.slice(0, 10)}T12:00`, days * 24).slice(0, 10)
export const hoursBetween = (a, b) => (new Date(b) - new Date(a)) / 3600000
export const daysBetween = (a, b) => Math.floor(hoursBetween(a.slice(0, 10), b.slice(0, 10)) / 24)
export const fmtHours = (h) => {
  const abs = Math.abs(h)
  if (abs >= 48) return `${Math.floor(abs / 24)} дн.`
  const hh = Math.floor(abs)
  const mm = Math.round((abs - hh) * 60)
  return hh ? `${hh} ч${mm ? ` ${mm} мин` : ''}` : `${mm} мин`
}
export const plural = (n, one, few, many) => {
  const m10 = n % 10
  const m100 = n % 100
  const w = m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many
  return `${n} ${w}`
}

// ---------- справочники ----------
export const client = (id) => CLIENTS.find((c) => c.id === id)
export const engineer = (id) => ENGINEERS.find((e) => e.id === id)
export const equipment = (r) => client(r.clientId)?.equipment.find((q) => q.id === r.equipmentId)

// ---------- бизнес-правила ----------
export const amount = (r) =>
  r.works.reduce((s, w) => s + w.price, 0) + r.parts.reduce((s, p) => s + p.price * p.qty, 0)
export const sum = (list) => list.reduce((s, r) => s + amount(r), 0)
export const OPEN = ['new', 'assigned']
// срок реакции по договору — пока инженер не приступил к работе
export const slaLeft = (r, now) => hoursBetween(now, addHours(r.createdAt, r.slaHours))
export const isOverdue = (r, now) => OPEN.includes(r.status) && slaLeft(r, now) < 0
export const underWarranty = (q, now) => q && q.warranty >= now.slice(0, 10)

export const STATUS = {
  new: { label: 'Новая', tone: 'blue' },
  assigned: { label: 'Назначена', tone: 'violet' },
  in_progress: { label: 'В работе', tone: 'amber' },
  done: { label: 'Выполнена, нет акта', tone: 'orange' },
  act_signed: { label: 'Акт подписан', tone: 'teal' },
  invoiced: { label: 'Ждём оплату', tone: 'rose' },
  paid: { label: 'Оплачена', tone: 'green' },
}

// ---------- состояние ----------
const STORAGE_KEY = 'orteko-prototype-v2'
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.requests) return saved
  } catch { /* хранилище недоступно — начинаем с демо-данных */ }
  return { ...initialState, clock: NOW }
}

function reducer(state, a) {
  // каждое действие немного двигает «часы», чтобы в истории были правдоподобные время и порядок
  const clock = addHours(state.clock, 0.15)
  const log = (r, text, who) => [...r.history, { at: clock, text, who }]
  const patch = (id, fn) => ({ ...state, clock, requests: state.requests.map((r) => (r.id === id ? fn(r) : r)) })

  switch (a.type) {
    case 'create': {
      const c = client(a.clientId)
      const r = {
        id: state.nextRequestId, clientId: a.clientId, equipmentId: a.equipmentId, problem: a.problem,
        channel: a.channel, priority: a.priority, createdAt: clock, slaHours: c.contract.sla,
        status: 'new', engineerId: null, works: [], parts: [], act: null, invoice: null, paidAt: null, reminders: 0,
        history: [{ at: clock, text: `Заявка создана (${a.channelLabel})`, who: 'Айгерим' }],
      }
      return { ...state, clock, requests: [r, ...state.requests], nextRequestId: state.nextRequestId + 1 }
    }
    case 'assign':
      return patch(a.id, (r) => ({ ...r, engineerId: a.engineerId, status: r.status === 'new' ? 'assigned' : r.status,
        history: log(r, `${r.engineerId ? 'Переназначен' : 'Назначен'} инженер: ${engineer(a.engineerId).short}`, 'Айгерим') }))
    case 'start':
      return patch(a.id, (r) => ({ ...r, status: 'in_progress', history: log(r, 'Инженер на месте, работа начата', engineer(r.engineerId)?.short) }))
    case 'addWork':
      return patch(a.id, (r) => ({ ...r, works: [...r.works, a.work] }))
    case 'removeWork':
      return patch(a.id, (r) => ({ ...r, works: r.works.filter((_, i) => i !== a.index) }))
    case 'issuePart': {
      // запчасть выдаётся только под заявку: списывается со склада и сразу попадает в акт
      const part = state.parts.find((p) => p.id === a.partId)
      const next = patch(a.id, (r) => {
        const has = r.parts.find((p) => p.partId === part.id)
        const parts = has
          ? r.parts.map((p) => (p.partId === part.id ? { ...p, qty: p.qty + a.qty } : p))
          : [...r.parts, { partId: part.id, name: part.name, price: part.price, qty: a.qty }]
        return { ...r, parts, history: log(r, `Со склада выдано: ${part.name} × ${a.qty}`, engineer(r.engineerId)?.short) }
      })
      return { ...next, parts: state.parts.map((p) => (p.id === part.id ? { ...p, stock: p.stock - a.qty } : p)) }
    }
    case 'complete':
      return patch(a.id, (r) => ({ ...r, status: 'done', history: log(r, 'Работа выполнена', engineer(r.engineerId)?.short) }))
    case 'signAct':
      return patch(a.id, (r) => ({ ...r, status: 'act_signed',
        act: { number: `А-${r.id}`, signedAt: clock, signer: a.signer, signature: a.signature },
        history: log(r, `Клиент подписал акт (${a.signer}). Акт отправлен клиенту и в бухгалтерию`, engineer(r.engineerId)?.short) }))
    case 'invoice': {
      const ids = new Set(a.ids)
      return { ...state, clock, requests: state.requests.map((r) => (ids.has(r.id)
        ? { ...r, status: 'invoiced', invoice: { number: `С-${r.id}`, date: clock.slice(0, 10) }, history: log(r, 'Выставлен счёт по акту', 'Руслан') }
        : r)) }
    }
    case 'pay':
      return patch(a.id, (r) => ({ ...r, status: 'paid', paidAt: clock.slice(0, 10), history: log(r, 'Оплата поступила', 'Сауле (бухгалтер)') }))
    case 'remindClient':
      return patch(a.id, (r) => ({ ...r, reminders: r.reminders + 1, history: log(r, 'Клиенту отправлено напоминание об оплате в WhatsApp', 'Система') }))
    case 'remindEngineer':
      return patch(a.id, (r) => ({ ...r, history: log(r, 'Инженеру отправлено напоминание: закрыть заявку актом', 'Руслан') }))
    case 'feedback':
      return { ...state, feedback: [{ id: state.nextFeedbackId, date: state.clock.slice(0, 10), status: 'new', ...a.item }, ...state.feedback],
        nextFeedbackId: state.nextFeedbackId + 1 }
    case 'reset':
      return { ...initialState, clock: NOW }
    default:
      return state
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* демо работает и без сохранения */ }
  }, [state])

  const toast = useCallback((text, tone = 'ok') => {
    const id = Math.random()
    setToasts((t) => [...t, { id, text, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])

  return <StoreContext.Provider value={{ state, dispatch, toast, toasts }}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
