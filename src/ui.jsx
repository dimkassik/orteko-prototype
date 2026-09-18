import { useEffect } from 'react'
import { Clock, Mail, MessageCircle, PhoneCall, TriangleAlert, X } from 'lucide-react'
import { engineer, fmtHours, isOverdue, OPEN, slaLeft, STATUS, useStore } from './store'

export function Badge({ tone = 'gray', children, icon: Icon }) {
  return <span className={`badge tone-${tone}`}>{Icon && <Icon size={13} />}{children}</span>
}

export const StatusBadge = ({ status }) => <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>

// таймер срока реакции по договору
export function SlaBadge({ r }) {
  const { state } = useStore()
  if (!OPEN.includes(r.status)) return null
  const left = slaLeft(r, state.clock)
  if (isOverdue(r, state.clock)) return <Badge tone="red" icon={TriangleAlert}>Просрочена на {fmtHours(left)}</Badge>
  return <Badge tone={left < 2 ? 'amber' : 'gray'} icon={Clock}>Осталось {fmtHours(left)}</Badge>
}

export function ChannelIcon({ channel, size = 14 }) {
  const Icon = { whatsapp: MessageCircle, email: Mail, call: PhoneCall }[channel]
  return <Icon size={size} className={`channel ch-${channel}`} aria-label={channel} />
}

export function Avatar({ id, size = 26 }) {
  const e = engineer(id)
  if (!e) return <span className="avatar empty" style={{ width: size, height: size }}>?</span>
  const initials = e.name.split(' ').map((w) => w[0]).join('')
  return <span className="avatar" title={e.name} style={{ width: size, height: size, background: e.color, fontSize: size * 0.4 }}>{initials}</span>
}

function useEscape(onClose) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
}

export function Drawer({ title, subtitle, onClose, children, wide }) {
  useEscape(onClose)
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={`drawer ${wide ? 'wide' : ''}`} role="dialog" aria-label={title}>
        <header className="drawer-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <div className="muted">{subtitle}</div>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>
        </header>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  )
}

export function Modal({ title, onClose, children, footer }) {
  useEscape(onClose)
  return (
    <div className="overlay center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label={title}>
        <header className="drawer-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть"><X size={18} /></button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  )
}

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => <div key={t.id} className={`toast ${t.tone}`}>{t.text}</div>)}
    </div>
  )
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>
}
