import { useCallback, useEffect, useState } from 'react'
import { ClipboardList, MessageSquarePlus, Play, RotateCcw, Smartphone, Wallet } from 'lucide-react'
import { PEOPLE, VERSION } from './data'
import { StoreProvider, useStore } from './store'
import { Modal, Toasts } from './ui'
import Manager from './screens/Manager'
import Dispatcher from './screens/Dispatcher'
import Engineer from './screens/Engineer'
import Feedback from './Feedback'
import Tour from './Tour'

const ROLES = [
  { id: 'manager', label: 'Владелец', who: PEOPLE.manager.name, icon: Wallet },
  { id: 'dispatcher', label: 'Диспетчер', who: PEOPLE.dispatcher.name, icon: ClipboardList },
  { id: 'engineer', label: 'Инженер', who: 'на выезде', icon: Smartphone },
]
const SCREENS = { manager: Manager, dispatcher: Dispatcher, engineer: Engineer }

const WELCOME_KEY = 'orteko-welcome-seen'
const seenWelcome = () => { try { return localStorage.getItem(WELCOME_KEY) === '1' } catch { return false } }
const markWelcome = () => { try { localStorage.setItem(WELCOME_KEY, '1') } catch { /* не важно */ } }

function Shell() {
  const { dispatch, toast } = useStore()
  const initial = ROLES.some((r) => `#${r.id}` === window.location.hash) ? window.location.hash.slice(1) : 'manager'
  const [role, setRoleState] = useState(initial)
  const [tourStep, setTourStep] = useState(null)
  const [feedback, setFeedback] = useState(false)
  const [welcome, setWelcome] = useState(!seenWelcome())

  const setRole = useCallback((r) => {
    setRoleState(r)
    history.replaceState(null, '', `#${r}`)
  }, [])
  useEffect(() => { window.scrollTo(0, 0) }, [role])

  const startTour = () => { markWelcome(); setWelcome(false); setFeedback(false); setTourStep(0) }
  const Screen = SCREENS[role]

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">О</span>
          <span><b>Ортеко</b><span className="muted small">сервис оборудования для кафе и ресторанов</span></span>
        </div>
        <nav className="roles" aria-label="Роль">
          {ROLES.map((r) => (
            <button key={r.id} className={role === r.id ? 'on' : ''} onClick={() => setRole(r.id)}>
              <r.icon size={16} /><span>{r.label}</span>
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <button className="btn ghost" onClick={startTour}><Play size={15} /> <span className="hide-s">Сценарий</span></button>
          <button className="btn" onClick={() => setFeedback(true)} data-tour="feedback-btn"><MessageSquarePlus size={15} /> <span className="hide-s">Отзыв</span></button>
        </div>
      </header>

      <main><Screen key={role} /></main>

      <footer className="footer">
        <span>Прототип для кейса «Ортеко» · пилот, версия {VERSION} · демо-данные, «сейчас» — 19 сентября 2026, 10:30</span>
        <button className="link" onClick={() => { dispatch({ type: 'reset' }); toast('Демо-данные восстановлены') }}><RotateCcw size={13} /> Сбросить демо</button>
      </footer>

      {tourStep !== null && <Tour step={tourStep} setStep={setTourStep} setRole={setRole} onClose={() => setTourStep(null)} />}
      {feedback && <Feedback role={role} onClose={() => setFeedback(false)} />}
      {welcome && (
        <Modal title="Прототип системы для «Ортеко»" onClose={() => { markWelcome(); setWelcome(false) }} footer={<>
          <button className="btn" onClick={() => { markWelcome(); setWelcome(false) }}>Осмотрюсь сам</button>
          <button className="btn primary" onClick={startTour}><Play size={15} /> Показать за 3 минуты</button>
        </>}>
          <p><b>Проблема:</b> оборот вырос почти вдвое, а денег на счёте столько же. Заявки, склад и акты теряются.</p>
          <p><b>Идея решения:</b> каждая заявка проходит путь «заявка → выезд → акт → счёт → оплата» в одной системе, а владелец видит, на каком шаге застряли деньги.</p>
          <div className="welcome-roles">
            {ROLES.map((r) => <div key={r.id}><r.icon size={18} /><b>{r.label}</b><span className="muted small">{{ manager: 'где застряли деньги', dispatcher: 'заявки и сроки', engineer: 'акт и подпись на месте' }[r.id]}</span></div>)}
          </div>
          <p className="muted small">Данные демонстрационные. Все действия работают: назначайте инженеров, подписывайте акты, выставляйте счета — цифры меняются во всех ролях.</p>
        </Modal>
      )}
      <Toasts />
    </div>
  )
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>
}
