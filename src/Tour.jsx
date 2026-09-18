import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

// сценарий показа: переключает роль и подсвечивает нужный блок
export const STEPS = [
  { role: 'manager', target: 'hero', title: 'Деньги, которые уже заработаны',
    text: 'Это экран владельца. Сверху — сумма за сделанную работу, которая ещё не пришла на счёт. Именно её «Ортеко» не видит сегодня.' },
  { role: 'manager', target: 'chart', title: 'Почему денег не больше',
    text: 'Начисления растут вместе с оборотом, а поступления стоят на месте. Разрыв между столбиками — это и есть «пропавшие» деньги.' },
  { role: 'manager', target: 'stages', title: 'Где именно застревают',
    text: 'Три шага, на которых теряются деньги: нет акта, нет счёта, нет оплаты. Нажмите на любой — увидите конкретные заявки и сможете действовать.' },
  { role: 'dispatcher', target: 'board', title: 'Ни одна заявка не теряется',
    text: 'Диспетчер видит все заявки из звонков, WhatsApp и почты. У каждой — таймер срока реакции по договору. Красные — срок уже нарушен.' },
  { role: 'dispatcher', target: 'urgent-card', title: 'Назначьте инженера',
    text: 'Кофейня написала в WhatsApp, по абонементу у неё 4 часа на реакцию. Откройте заявку и назначьте инженера — он сразу получит её на телефон.' },
  { role: 'engineer', target: 'phone', title: 'Акт подписывается на месте',
    text: 'Максим на выезде. Откройте его заявку в работе: добавьте работу, найдите и выдайте запчасть, нажмите «Акт» и распишитесь пальцем за клиента.' },
  { role: 'manager', target: 'stages', title: 'Деньги сдвинулись',
    text: 'Подписанный акт уже здесь, в шаге «Акт подписан — счёта нет». Откройте его и выставите счёт одной кнопкой — деньги стали на шаг ближе к счёту.' },
  { role: null, target: 'feedback-btn', title: 'Работаем короткими циклами',
    text: 'Каждые 2–4 дня встречаемся с сотрудниками «Ортеко». Всё, что мешает, они пишут сюда — и видят, что уже исправлено в новой версии.' },
]

export default function Tour({ step, setStep, setRole, onClose }) {
  const s = STEPS[step]

  useEffect(() => {
    if (s.role) setRole(s.role)
    let el
    const t = setTimeout(() => {
      el = document.querySelector(`[data-tour="${s.target}"]`)
      if (!el) return
      el.classList.add('tour-target')
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)
    return () => { clearTimeout(t); el?.classList.remove('tour-target') }
  }, [step, s, setRole])

  return (
    <div className="tour" role="dialog" aria-label="Сценарий демо">
      <div className="row between">
        <span className="muted small">Шаг {step + 1} из {STEPS.length}</span>
        <button className="icon-btn" onClick={onClose} aria-label="Закрыть сценарий"><X size={16} /></button>
      </div>
      <div className="tour-progress"><span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
      <h3>{s.title}</h3>
      <p>{s.text}</p>
      <div className="row between">
        <button className="btn" disabled={!step} onClick={() => setStep(step - 1)}><ChevronLeft size={16} /> Назад</button>
        {step < STEPS.length - 1
          ? <button className="btn primary" onClick={() => setStep(step + 1)}>Далее <ChevronRight size={16} /></button>
          : <button className="btn primary" onClick={onClose}>Готово</button>}
      </div>
    </div>
  )
}
