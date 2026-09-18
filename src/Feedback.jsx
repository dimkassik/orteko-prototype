import { useState } from 'react'
import { Lightbulb, Send, ThumbsUp, TriangleAlert } from 'lucide-react'
import { VERSION } from './data'
import { fmtDate, useStore } from './store'
import { Badge, Drawer } from './ui'

const TYPES = {
  problem: { label: 'Мешает', icon: TriangleAlert, tone: 'red' },
  idea: { label: 'Идея', icon: Lightbulb, tone: 'amber' },
  like: { label: 'Нравится', icon: ThumbsUp, tone: 'green' },
}
const STATUSES = {
  new: { label: 'Новый — разберём на встрече', tone: 'blue' },
  accepted: { label: 'Принято', tone: 'violet' },
  in_progress: { label: 'В работе', tone: 'amber' },
  done: { label: 'Сделано', tone: 'green' },
}
const AUTHORS = { manager: 'Руслан, владелец', dispatcher: 'Айгерим, диспетчер', engineer: 'Инженер' }
const SCREENS = { manager: '«Где деньги»', dispatcher: '«Заявки»', engineer: 'телефон инженера' }

export default function Feedback({ role, onClose }) {
  const { state, dispatch, toast } = useStore()
  const [type, setType] = useState('problem')
  const [text, setText] = useState('')
  const send = () => {
    dispatch({ type: 'feedback', item: { role, author: AUTHORS[role], type, text: text.trim() } })
    toast('Спасибо! Разберём на ближайшей встрече')
    setText('')
  }
  return (
    <Drawer title="Отзывы сотрудников" subtitle={`Пилот · версия ${VERSION}`} onClose={onClose}>
      <div className="note">
        Мы встречаемся с командой «Ортеко» каждые 2–4 дня: смотрим, как вы работаете в системе, разбираем эти отзывы
        и выпускаем новую версию. <b>Следующая встреча — 22 сентября, 10:00.</b>
      </div>

      <section className="block">
        <h3>Что сейчас на экране {SCREENS[role]}?</h3>
        <div className="segmented">
          {Object.entries(TYPES).map(([id, t]) => (
            <button key={id} className={type === id ? 'on' : ''} onClick={() => setType(id)}><t.icon size={14} /> {t.label}</button>
          ))}
        </div>
        <textarea rows="3" className="full" value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Например: неудобно искать клиента, хочу видеть телефон сразу в карточке" />
        <button className="btn primary" disabled={text.trim().length < 5} onClick={send}><Send size={15} /> Отправить</button>
      </section>

      <section className="block">
        <h3>Что уже прислали</h3>
        <ul className="feedback">
          {state.feedback.map((f) => {
            const t = TYPES[f.type]
            return (
              <li key={f.id}>
                <div className="row between wrap gap-s">
                  <span className="row gap-s"><Badge tone={t.tone} icon={t.icon}>{t.label}</Badge><span className="small">{f.author}</span></span>
                  <span className="muted small">{fmtDate(f.date)}</span>
                </div>
                <p>{f.text}</p>
                <Badge tone={STATUSES[f.status].tone}>{STATUSES[f.status].label}{f.doneIn ? ` в версии ${f.doneIn}` : ''}</Badge>
              </li>
            )
          })}
        </ul>
      </section>
    </Drawer>
  )
}
