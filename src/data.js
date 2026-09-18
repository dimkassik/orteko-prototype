// Демо-данные «Ортеко». «Сейчас» зафиксировано, чтобы сроки и просрочки выглядели одинаково у всех.
export const NOW = '2026-09-19T10:30'
export const TODAY = NOW.slice(0, 10)
export const VERSION = '0.3'

export const PEOPLE = {
  manager: { name: 'Руслан Ахметов', role: 'Владелец' },
  dispatcher: { name: 'Айгерим Касымова', role: 'Диспетчер' },
}

export const ENGINEERS = [
  { id: 'e1', name: 'Асхат Нурланов', short: 'Асхат', color: '#7c3aed' },
  { id: 'e2', name: 'Ерлан Сапаров', short: 'Ерлан', color: '#0891b2' },
  { id: 'e3', name: 'Максим Ким', short: 'Максим', color: '#d97706' },
  { id: 'e4', name: 'Данияр Абенов', short: 'Данияр', color: '#db2777' },
]

export const WORKS = [
  { id: 'w1', name: 'Диагностика', price: 15000 },
  { id: 'w2', name: 'Ремонт, 1 час', price: 20000 },
  { id: 'w3', name: 'Плановое ТО', price: 35000 },
  { id: 'w4', name: 'Чистка и декальцинация', price: 25000 },
  { id: 'w5', name: 'Срочный выезд', price: 15000 },
  { id: 'w6', name: 'Выезд за город', price: 10000 },
]

export const CHANNELS = { call: 'Звонок', whatsapp: 'WhatsApp', email: 'Почта' }

// contract: абонемент — фиксированная плата и короткий срок реакции; разовые — оплата по факту
export const CLIENTS = [
  { id: 1, name: 'Кофейня «Зерно»', kind: 'Сеть кофеен, 3 точки', address: 'пр. Абая, 52', contact: 'Алия, управляющая', phone: '+7 700 100 20 01',
    contract: { type: 'Абонемент', fee: 45000, sla: 4 }, payDays: 10,
    equipment: [
      { id: 'q11', model: 'Кофемашина La Marzocco Linea PB', serial: 'LM-22817', warranty: '2027-03-01' },
      { id: 'q12', model: 'Кофемолка Mahlkönig E65S', serial: 'MK-55102', warranty: '2026-05-10' },
    ] },
  { id: 2, name: 'Ресторан «Дастархан»', kind: 'Ресторан, 120 мест', address: 'ул. Панфилова, 98', contact: 'Бауыржан, шеф-повар', phone: '+7 700 100 20 02',
    contract: { type: 'Абонемент', fee: 80000, sla: 4 }, payDays: 15,
    equipment: [
      { id: 'q21', model: 'Пароконвектомат Rational iCombi Pro 10-1/1', serial: 'RA-90231', warranty: '2027-08-15' },
      { id: 'q22', model: 'Посудомоечная машина Hobart AMX', serial: 'HB-11809', warranty: '2025-12-01' },
      { id: 'q23', model: 'Холодильная витрина Carboma', serial: 'CB-3321', warranty: '2025-02-20' },
    ] },
  { id: 3, name: 'Кафе «Самса Хаус»', kind: 'Кафе у дома', address: 'мкр. Самал-2, 17', contact: 'Ержан, владелец', phone: '+7 700 100 20 03',
    contract: { type: 'Разовые', fee: 0, sla: 24 }, payDays: 7,
    equipment: [{ id: 'q31', model: 'Холодильная витрина Polair', serial: 'PL-7710', warranty: '2025-10-01' }] },
  { id: 4, name: 'Бургерная «Гриль №1»', kind: 'Фастфуд, 2 точки', address: 'ул. Сатпаева, 30', contact: 'Дмитрий, управляющий', phone: '+7 700 100 20 04',
    contract: { type: 'Абонемент', fee: 60000, sla: 4 }, payDays: 10,
    equipment: [
      { id: 'q41', model: 'Фритюрница Frymaster', serial: 'FM-4402', warranty: '2026-11-30' },
      { id: 'q42', model: 'Кофемашина Wega Polaris', serial: 'WG-1290', warranty: '2025-06-01' },
    ] },
  { id: 5, name: 'Ресторан «Томирис»', kind: 'Ресторан, банкеты', address: 'ул. Жандосова, 60', contact: 'Гульнара, администратор', phone: '+7 700 100 20 05',
    contract: { type: 'Разовые', fee: 0, sla: 24 }, payDays: 14,
    equipment: [
      { id: 'q51', model: 'Пароконвектомат Rational SCC 61', serial: 'RA-44120', warranty: '2024-09-01' },
      { id: 'q52', model: 'Холодильная витрина Polair', serial: 'PL-8821', warranty: '2026-01-15' },
    ] },
  { id: 6, name: 'Кофейня «Бариста»', kind: 'Кофейня', address: 'ул. Кабанбай батыра, 115', contact: 'Самал, бариста', phone: '+7 700 100 20 06',
    contract: { type: 'Абонемент', fee: 45000, sla: 4 }, payDays: 10,
    equipment: [{ id: 'q61', model: 'Кофемашина Nuova Simonelli Aurelia', serial: 'NS-6613', warranty: '2027-01-20' }] },
  { id: 7, name: 'Столовая «Береке»', kind: 'Столовая бизнес-центра', address: 'ул. Толе би, 101', contact: 'Марина, заведующая', phone: '+7 700 100 20 07',
    contract: { type: 'Разовые', fee: 0, sla: 24 }, payDays: 10,
    equipment: [
      { id: 'q71', model: 'Посудомоечная машина Hobart', serial: 'HB-20021', warranty: '2025-04-01' },
      { id: 'q72', model: 'Фритюрница Frymaster', serial: 'FM-5530', warranty: '2025-09-01' },
    ] },
  { id: 8, name: 'Пиццерия «Неаполь»', kind: 'Пиццерия', address: 'ул. Гоголя, 40', contact: 'Антон, шеф', phone: '+7 700 100 20 08',
    contract: { type: 'Абонемент', fee: 60000, sla: 8 }, payDays: 10,
    equipment: [
      { id: 'q81', model: 'Пароконвектомат Unox Cheftop', serial: 'UX-7781', warranty: '2026-12-01' },
      { id: 'q82', model: 'Посудомоечная машина Winterhalter', serial: 'WH-3390', warranty: '2027-02-01' },
    ] },
  { id: 9, name: 'Кондитерская «Шоколад»', kind: 'Кондитерская', address: 'ул. Фурманова, 12', contact: 'Ирина, технолог', phone: '+7 700 100 20 09',
    contract: { type: 'Разовые', fee: 0, sla: 24 }, payDays: 7,
    equipment: [{ id: 'q91', model: 'Льдогенератор Scotsman', serial: 'SC-1004', warranty: '2026-06-30' }] },
  { id: 10, name: 'Отель «Алатау», ресторан', kind: 'Ресторан при отеле', address: 'пр. Достык, 200', contact: 'Нурлан, главный инженер', phone: '+7 700 100 20 10',
    contract: { type: 'Абонемент', fee: 150000, sla: 4 }, payDays: 20,
    equipment: [
      { id: 'q101', model: 'Пароконвектомат Rational iCombi Pro 20-1/1', serial: 'RA-99001', warranty: '2028-01-01' },
      { id: 'q102', model: 'Посудомоечная машина Winterhalter PT-M', serial: 'WH-5521', warranty: '2027-06-01' },
    ] },
]

export const PARTS = [
  { id: 'p1', sku: 'LM-GSK', name: 'Уплотнитель группы кофемашины', price: 6500, stock: 14, min: 5 },
  { id: 'p2', sku: 'RA-HTR6', name: 'ТЭН пароконвектомата 6 кВт', price: 48000, stock: 2, min: 3 },
  { id: 'p3', sku: 'HB-PMP', name: 'Помпа посудомоечной машины', price: 62000, stock: 3, min: 2 },
  { id: 'p4', sku: 'CMP-12', name: 'Компрессор холодильной витрины', price: 115000, stock: 1, min: 2 },
  { id: 'p5', sku: 'TS-01', name: 'Датчик температуры', price: 9000, stock: 20, min: 6 },
  { id: 'p6', sku: 'FLT-W', name: 'Фильтр для воды', price: 12000, stock: 4, min: 8 },
  { id: 'p7', sku: 'FM-THR', name: 'Термостат фритюрницы', price: 21000, stock: 6, min: 3 },
  { id: 'p8', sku: 'SOL-V', name: 'Электромагнитный клапан', price: 18000, stock: 7, min: 4 },
  { id: 'p9', sku: 'DR-SL', name: 'Уплотнитель двери пароконвектомата', price: 27000, stock: 5, min: 2 },
  { id: 'p10', sku: 'FAN-M', name: 'Мотор вентилятора', price: 54000, stock: 2, min: 2 },
]

// ---------- заявки ----------
const W = (id, qty = 1) => Array.from({ length: qty }, () => ({ ...WORKS.find((w) => w.id === id) }))
const P = (id, qty = 1) => {
  const p = PARTS.find((x) => x.id === id)
  return { partId: id, name: p.name, price: p.price, qty }
}

// s — статус; даты: c — создана, a — акт подписан, i — счёт, pd — оплата
const raw = [
  // новые и в работе
  { id: 1087, client: 6, eq: 'q61', problem: 'Течёт из-под группы, мокро под машиной', ch: 'whatsapp', pr: 'high', c: '2026-09-19T08:05', s: 'new' },
  { id: 1086, client: 10, eq: 'q102', problem: 'Посуда выходит с разводами', ch: 'email', pr: 'normal', c: '2026-09-19T09:40', s: 'new' },
  { id: 1085, client: 3, eq: 'q31', problem: 'Шумит компрессор, температура +9', ch: 'call', pr: 'high', c: '2026-09-18T17:20', s: 'new' },
  { id: 1084, client: 2, eq: 'q21', problem: 'Не набирает температуру, ошибка Service 34', ch: 'call', pr: 'high', c: '2026-09-19T07:50', s: 'assigned', eng: 'e2' },
  { id: 1083, client: 8, eq: 'q81', problem: 'Плановое ТО по абонементу', ch: 'call', pr: 'normal', c: '2026-09-18T11:00', s: 'assigned', eng: 'e2' },
  { id: 1080, client: 4, eq: 'q41', problem: 'Масло перегревается, срабатывает защита', ch: 'whatsapp', pr: 'high', c: '2026-09-16T10:15', s: 'assigned', eng: 'e3' },
  { id: 1082, client: 1, eq: 'q11', problem: 'Слабое давление пара', ch: 'whatsapp', pr: 'normal', c: '2026-09-19T08:30', s: 'in_progress', eng: 'e4', works: [...W('w1')] },
  { id: 1078, client: 7, eq: 'q71', problem: 'Не сливает воду', ch: 'call', pr: 'normal', c: '2026-09-15T13:00', s: 'in_progress', eng: 'e3', works: [...W('w1')] },

  // выполнено, акта нет — главная утечка
  { id: 1074, client: 5, eq: 'q52', problem: 'Не охлаждает', ch: 'call', pr: 'high', c: '2026-09-09T09:00', s: 'done', eng: 'e1', works: [...W('w1'), ...W('w2', 3)], parts: [P('p4')] },
  { id: 1071, client: 10, eq: 'q101', problem: 'Плановое ТО по абонементу', ch: 'email', pr: 'normal', c: '2026-09-05T10:00', s: 'done', eng: 'e1', works: [...W('w3', 2), ...W('w4')], parts: [P('p9'), P('p6', 2)] },
  { id: 1076, client: 1, eq: 'q12', problem: 'Неравномерный помол', ch: 'whatsapp', pr: 'normal', c: '2026-09-12T12:00', s: 'done', eng: 'e1', works: [...W('w2')], parts: [P('p5')] },
  { id: 1077, client: 8, eq: 'q82', problem: 'Ошибка налива воды', ch: 'call', pr: 'normal', c: '2026-09-13T15:30', s: 'done', eng: 'e3', works: [...W('w1'), ...W('w2')], parts: [P('p8')] },
  { id: 1079, client: 9, eq: 'q91', problem: 'Мало льда', ch: 'call', pr: 'normal', c: '2026-09-17T09:10', s: 'done', eng: 'e4', works: [...W('w4')], parts: [P('p6')] },

  // акт подписан, счёта нет
  { id: 1070, client: 2, eq: 'q22', problem: 'Слабый напор', ch: 'call', pr: 'normal', c: '2026-09-04T11:00', s: 'act_signed', eng: 'e3', a: '2026-09-05', works: [...W('w2', 2)], parts: [P('p3')] },
  { id: 1073, client: 6, eq: 'q61', problem: 'Плановое ТО по абонементу', ch: 'call', pr: 'normal', c: '2026-09-08T10:00', s: 'act_signed', eng: 'e4', a: '2026-09-08', works: [...W('w3')], parts: [P('p1'), P('p6')] },
  { id: 1075, client: 4, eq: 'q42', problem: 'Не греет бойлер', ch: 'whatsapp', pr: 'high', c: '2026-09-11T08:40', s: 'act_signed', eng: 'e2', a: '2026-09-11', works: [...W('w5'), ...W('w2', 2)], parts: [P('p8'), P('p5')] },

  // счёт выставлен, ждём оплату (разный «возраст» долга)
  { id: 1031, client: 7, eq: 'q72', problem: 'Не включается', ch: 'call', pr: 'normal', c: '2026-06-17T10:00', s: 'invoiced', eng: 'e2', a: '2026-06-18', i: '2026-06-20', works: [...W('w1'), ...W('w2', 2)], parts: [P('p7')] },
  { id: 1042, client: 5, eq: 'q51', problem: 'Не держит пар', ch: 'call', pr: 'high', c: '2026-07-07T09:00', s: 'invoiced', eng: 'e3', a: '2026-07-08', i: '2026-07-10', works: [...W('w1'), ...W('w2', 2)], parts: [P('p2'), P('p10')] },
  { id: 1049, client: 3, eq: 'q31', problem: 'Обмерзает испаритель', ch: 'call', pr: 'normal', c: '2026-07-24T16:00', s: 'invoiced', eng: 'e1', a: '2026-07-25', i: '2026-07-28', works: [...W('w2', 2), ...W('w6')], parts: [P('p5', 2), P('p8')] },
  { id: 1055, client: 10, eq: 'q101', problem: 'Ошибка вентилятора', ch: 'email', pr: 'high', c: '2026-08-10T09:30', s: 'invoiced', eng: 'e2', a: '2026-08-10', i: '2026-08-12', works: [...W('w5'), ...W('w2', 3)], parts: [P('p10'), P('p9')] },
  { id: 1061, client: 2, eq: 'q23', problem: 'Не горит подсветка, конденсат', ch: 'whatsapp', pr: 'normal', c: '2026-08-27T12:00', s: 'invoiced', eng: 'e1', a: '2026-08-28', i: '2026-08-30', works: [...W('w2', 2)], parts: [P('p5'), P('p8')] },
  { id: 1066, client: 4, eq: 'q41', problem: 'Плановое ТО по абонементу', ch: 'call', pr: 'normal', c: '2026-09-02T10:00', s: 'invoiced', eng: 'e4', a: '2026-09-03', i: '2026-09-08', works: [...W('w3')], parts: [P('p7')] },
  { id: 1068, client: 9, eq: 'q91', problem: 'Не включается', ch: 'call', pr: 'normal', c: '2026-09-12T11:00', s: 'invoiced', eng: 'e2', a: '2026-09-13', i: '2026-09-15', works: [...W('w1'), ...W('w2')], parts: [P('p8')] },

  // оплачено в сентябре
  { id: 1052, client: 1, eq: 'q11', problem: 'Плановое ТО по абонементу', ch: 'call', pr: 'normal', c: '2026-08-04T10:00', s: 'paid', eng: 'e4', a: '2026-08-04', i: '2026-08-07', pd: '2026-09-02', works: [...W('w3')], parts: [P('p1', 2), P('p6')] },
  { id: 1058, client: 8, eq: 'q82', problem: 'Плановое ТО по абонементу', ch: 'call', pr: 'normal', c: '2026-08-20T10:00', s: 'paid', eng: 'e3', a: '2026-08-21', i: '2026-08-23', pd: '2026-09-10', works: [...W('w3')], parts: [] },
  { id: 1063, client: 2, eq: 'q21', problem: 'Не открывается дверь', ch: 'call', pr: 'high', c: '2026-09-01T09:00', s: 'paid', eng: 'e2', a: '2026-09-01', i: '2026-09-02', pd: '2026-09-16', works: [...W('w5'), ...W('w2')], parts: [P('p9')] },
  { id: 1064, client: 6, eq: 'q61', problem: 'Протекает кран пара', ch: 'whatsapp', pr: 'normal', c: '2026-09-02T14:00', s: 'paid', eng: 'e4', a: '2026-09-02', i: '2026-09-03', pd: '2026-09-12', works: [...W('w2')], parts: [P('p1')] },
]

const at = (d, t = '12:00') => (d.length > 10 ? d : `${d}T${t}`)
const pad = (n) => String(n).padStart(2, '0')
// локальное время без перевода в UTC (toISOString сдвинул бы часы)
export const toLocalIso = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
export const addHours = (iso, h) => {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() + Math.round(h * 60))
  return toLocalIso(d)
}

// история заявки строится из её дат — как журнал событий в настоящей системе
function history(r, eng) {
  const h = [{ at: r.c, text: `Заявка создана (${CHANNELS[r.ch]})`, who: 'Айгерим' }]
  const order = ['new', 'assigned', 'in_progress', 'done', 'act_signed', 'invoiced', 'paid']
  const reached = (s) => order.indexOf(r.s) >= order.indexOf(s)
  if (reached('assigned')) h.push({ at: addHours(r.c, 1), text: `Назначен инженер: ${eng?.short}`, who: 'Айгерим' })
  if (reached('in_progress')) h.push({ at: addHours(r.c, 3), text: 'Инженер на месте, работа начата', who: eng?.short })
  if (reached('done')) h.push({ at: addHours(r.c, 6), text: 'Работа выполнена', who: eng?.short })
  if (reached('act_signed')) h.push({ at: at(r.a, '18:00'), text: 'Клиент подписал акт', who: eng?.short })
  if (reached('invoiced')) h.push({ at: at(r.i, '11:00'), text: 'Выставлен счёт', who: 'Сауле (бухгалтер)' })
  if (reached('paid')) h.push({ at: at(r.pd, '15:00'), text: 'Оплата поступила', who: 'Сауле (бухгалтер)' })
  return h
}

const requests = raw.map((r) => {
  const client = CLIENTS.find((c) => c.id === r.client)
  const eng = ENGINEERS.find((e) => e.id === r.eng)
  return {
    id: r.id, clientId: r.client, equipmentId: r.eq, problem: r.problem, channel: r.ch, priority: r.pr,
    createdAt: r.c, slaHours: client.contract.sla, status: r.s, engineerId: r.eng ?? null,
    works: r.works ?? [], parts: r.parts ?? [],
    act: r.a ? { number: `А-${r.id}`, signedAt: at(r.a, '18:00'), signer: client.contact.split(',')[0], signature: null } : null,
    invoice: r.i ? { number: `С-${r.id}`, date: r.i } : null,
    paidAt: r.pd ?? null,
    reminders: 0,
    history: history(r, eng),
  }
})

// отзывы сотрудников «Ортеко» за пилот — показывают работу короткими циклами
const feedback = [
  { id: 1, role: 'engineer', author: 'Ерлан, инженер', type: 'problem', text: 'На телефоне неудобно искать запчасть в длинном списке — нужен поиск.', date: '2026-09-15', status: 'done', doneIn: '0.2' },
  { id: 2, role: 'dispatcher', author: 'Айгерим, диспетчер', type: 'idea', text: 'Показывать, сколько часов осталось до нарушения срока по договору.', date: '2026-09-16', status: 'done', doneIn: '0.3' },
  { id: 3, role: 'manager', author: 'Руслан, владелец', type: 'like', text: 'Впервые вижу, кто и сколько нам должен, не спрашивая бухгалтера.', date: '2026-09-17', status: 'accepted' },
  { id: 4, role: 'manager', author: 'Сауле, бухгалтер', type: 'problem', text: 'Нужна выгрузка счетов в 1С, сейчас переношу руками.', date: '2026-09-18', status: 'in_progress' },
]

// начислено и получено по сервису, ₸ — «оборот растёт, а денег не больше»
export const HISTORY = [
  { month: 'Апр', accrued: 2100000, received: 2050000 },
  { month: 'Май', accrued: 2450000, received: 2100000 },
  { month: 'Июн', accrued: 2900000, received: 2150000 },
  { month: 'Июл', accrued: 3350000, received: 2200000 },
  { month: 'Авг', accrued: 3800000, received: 2250000 },
]
// сентябрь: всё, что не входит в демо-заявки (абонементы и прочее) + живые данные из заявок
export const SEPT_BASE = { accrued: 1650000, received: 1150000 }

export const initialState = {
  requests,
  parts: PARTS,
  feedback,
  nextRequestId: 1088,
  nextFeedbackId: 5,
}
