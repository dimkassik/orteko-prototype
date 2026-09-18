// Демо-данные прототипа. «Сегодня» зафиксировано, чтобы сроки и просрочки выглядели одинаково.
export const TODAY = '2026-09-19'

// Путь заявки: от обращения до денег на счёте
export const STATUSES = [
  { id: 'new', label: 'Новая' },
  { id: 'assigned', label: 'Назначена' },
  { id: 'in_progress', label: 'В работе' },
  { id: 'done', label: 'Выполнена' },
  { id: 'act_signed', label: 'Акт подписан' },
  { id: 'invoiced', label: 'Счёт выставлен' },
  { id: 'paid', label: 'Оплачена' },
]

export const ENGINEERS = ['Асхат', 'Ерлан', 'Максим', 'Данияр']

export const WORKS = [
  { name: 'Диагностика', price: 15000 },
  { name: 'Ремонт (1 час)', price: 20000 },
  { name: 'Плановое ТО', price: 35000 },
  { name: 'Выезд за город', price: 10000 },
]

export const clients = [
  { id: 1, name: 'Кофейня «Зерно»', contract: 'Абонемент' },
  { id: 2, name: 'Ресторан «Дастархан»', contract: 'Абонемент' },
  { id: 3, name: 'Кафе «Самса Хаус»', contract: 'По вызову' },
  { id: 4, name: 'Бургерная «Гриль №1»', contract: 'Абонемент' },
  { id: 5, name: 'Ресторан «Томирис»', contract: 'По вызову' },
  { id: 6, name: 'Кофейня «Бариста»', contract: 'Абонемент' },
  { id: 7, name: 'Столовая «Береке»', contract: 'По вызову' },
  { id: 8, name: 'Пиццерия «Неаполь»', contract: 'Абонемент' },
]

const parts = [
  { id: 1, name: 'Уплотнитель группы кофемашины', price: 6500, stock: 14, min: 5 },
  { id: 2, name: 'Тэн пароконвектомата 6 кВт', price: 48000, stock: 2, min: 3 },
  { id: 3, name: 'Помпа посудомоечной машины', price: 62000, stock: 3, min: 2 },
  { id: 4, name: 'Компрессор холодильной витрины', price: 115000, stock: 1, min: 2 },
  { id: 5, name: 'Датчик температуры', price: 9000, stock: 20, min: 6 },
  { id: 6, name: 'Фильтр для воды', price: 12000, stock: 4, min: 8 },
  { id: 7, name: 'Термостат фритюрницы', price: 21000, stock: 6, min: 3 },
]

const w = (name) => ({ ...WORKS.find((x) => x.name === name) })
const p = (id, qty = 1) => {
  const part = parts.find((x) => x.id === id)
  return { partId: id, name: part.name, qty, price: part.price }
}

// created — дата обращения, due — срок по договору; invoiceDate/paidDate — для денег
const requests = [
  { id: 1041, clientId: 2, equipment: 'Пароконвектомат Rational', problem: 'Не набирает температуру', engineer: 'Асхат', created: '2026-09-18', due: '2026-09-19', status: 'in_progress', works: [w('Диагностика')], parts: [] },
  { id: 1042, clientId: 6, equipment: 'Кофемашина La Marzocco', problem: 'Течёт из-под группы', engineer: null, created: '2026-09-19', due: '2026-09-20', status: 'new', works: [], parts: [] },
  { id: 1038, clientId: 4, equipment: 'Фритюрница Frymaster', problem: 'Масло перегревается', engineer: 'Ерлан', created: '2026-09-15', due: '2026-09-16', status: 'assigned', works: [], parts: [] },
  { id: 1036, clientId: 7, equipment: 'Посудомоечная машина Hobart', problem: 'Не сливает воду', engineer: 'Максим', created: '2026-09-12', due: '2026-09-14', status: 'in_progress', works: [w('Диагностика')], parts: [] },
  { id: 1043, clientId: 3, equipment: 'Холодильная витрина Polair', problem: 'Шумит компрессор', engineer: null, created: '2026-09-19', due: '2026-09-21', status: 'new', works: [], parts: [] },

  { id: 1030, clientId: 1, equipment: 'Кофемашина La Marzocco', problem: 'Плановое ТО', engineer: 'Данияр', created: '2026-09-05', due: '2026-09-08', status: 'done', works: [w('Плановое ТО')], parts: [p(1, 2), p(6)] },
  { id: 1027, clientId: 5, equipment: 'Холодильная витрина Polair', problem: 'Не охлаждает', engineer: 'Асхат', created: '2026-08-29', due: '2026-08-30', status: 'done', works: [w('Диагностика'), w('Ремонт (1 час)'), w('Ремонт (1 час)')], parts: [p(4)] },
  { id: 1033, clientId: 8, equipment: 'Пароконвектомат Unox', problem: 'Ошибка E08', engineer: 'Ерлан', created: '2026-09-09', due: '2026-09-10', status: 'done', works: [w('Диагностика'), w('Ремонт (1 час)')], parts: [p(2)] },

  { id: 1025, clientId: 2, equipment: 'Посудомоечная машина Hobart', problem: 'Слабый напор', engineer: 'Максим', created: '2026-08-25', due: '2026-08-26', status: 'act_signed', works: [w('Ремонт (1 час)')], parts: [p(3)] },
  { id: 1031, clientId: 6, equipment: 'Кофемашина Nuova Simonelli', problem: 'Плановое ТО', engineer: 'Данияр', created: '2026-09-06', due: '2026-09-09', status: 'act_signed', works: [w('Плановое ТО')], parts: [p(1), p(6)] },

  { id: 1012, clientId: 7, equipment: 'Фритюрница Frymaster', problem: 'Не включается', engineer: 'Ерлан', created: '2026-07-08', due: '2026-07-09', status: 'invoiced', invoiceDate: '2026-07-14', works: [w('Диагностика'), w('Ремонт (1 час)')], parts: [p(7)] },
  { id: 1016, clientId: 3, equipment: 'Холодильная витрина Polair', problem: 'Обмерзает испаритель', engineer: 'Асхат', created: '2026-07-20', due: '2026-07-21', status: 'invoiced', invoiceDate: '2026-07-28', works: [w('Ремонт (1 час)'), w('Ремонт (1 час)'), w('Выезд за город')], parts: [p(5, 2)] },
  { id: 1021, clientId: 5, equipment: 'Пароконвектомат Rational', problem: 'Не держит пар', engineer: 'Максим', created: '2026-08-12', due: '2026-08-13', status: 'invoiced', invoiceDate: '2026-08-15', works: [w('Диагностика'), w('Ремонт (1 час)')], parts: [p(2)] },
  { id: 1028, clientId: 4, equipment: 'Кофемашина Wega', problem: 'Плановое ТО', engineer: 'Данияр', created: '2026-09-01', due: '2026-09-03', status: 'invoiced', invoiceDate: '2026-09-04', works: [w('Плановое ТО')], parts: [p(1), p(6)] },

  { id: 1019, clientId: 1, equipment: 'Ледогенератор Scotsman', problem: 'Мало льда', engineer: 'Ерлан', created: '2026-08-04', due: '2026-08-05', status: 'paid', invoiceDate: '2026-08-07', paidDate: '2026-09-02', works: [w('Ремонт (1 час)')], parts: [p(6)] },
  { id: 1024, clientId: 8, equipment: 'Посудомоечная машина Winterhalter', problem: 'Плановое ТО', engineer: 'Максим', created: '2026-08-20', due: '2026-08-22', status: 'paid', invoiceDate: '2026-08-23', paidDate: '2026-09-10', works: [w('Плановое ТО')], parts: [] },
  { id: 1029, clientId: 2, equipment: 'Холодильная витрина Carboma', problem: 'Не горит подсветка', engineer: 'Асхат', created: '2026-09-02', due: '2026-09-04', status: 'paid', invoiceDate: '2026-09-05', paidDate: '2026-09-16', works: [w('Ремонт (1 час)')], parts: [p(5)] },
]

export const initialState = { requests, parts, nextId: 1044 }
