import Papa from 'papaparse'
import {
  CSV_SECTION_TRAVELERS,
  CSV_SECTION_EXPENSES,
  CSV_SECTION_PAYMENTS,
} from '../constants.js'

function parseSection(text, marker) {
  const start = text.indexOf(marker)
  if (start === -1) return []
  const afterMarker = text.indexOf('\n', start) + 1
  const nextMarker = text.indexOf('[', afterMarker)
  const block = nextMarker === -1
    ? text.slice(afterMarker)
    : text.slice(afterMarker, nextMarker)
  const result = Papa.parse(block.trim(), { header: true, skipEmptyLines: true })
  return result.data
}

function requireColumns(rows, cols, section) {
  if (rows.length === 0) return
  const keys = Object.keys(rows[0])
  cols.forEach(col => {
    if (!keys.includes(col)) throw new Error(`${section}: missing column "${col}"`)
  })
}

export function parseCsv(text) {
  const tRows = parseSection(text, CSV_SECTION_TRAVELERS)
  const eRows = parseSection(text, CSV_SECTION_EXPENSES)
  const pRows = parseSection(text, CSV_SECTION_PAYMENTS)

  requireColumns(tRows, ['id', 'nickname'], 'TRAVELERS')
  requireColumns(eRows, ['id', 'name', 'date', 'amount', 'paidById', 'applicableTo'], 'EXPENSES')
  requireColumns(pRows, ['id', 'fromId', 'toId', 'amount', 'date'], 'PAYMENTS')

  const travelers = tRows.map(r => {
    if (!r.id || !r.nickname) throw new Error('TRAVELERS: each row must have id and nickname')
    return { id: r.id, nickname: r.nickname.trim() }
  })

  const expenses = eRows.map(r => {
    const amount = parseFloat(r.amount)
    if (isNaN(amount) || amount <= 0) throw new Error(`EXPENSES: invalid amount "${r.amount}"`)
    const applicableTo = r.applicableTo
      ? r.applicableTo.split(',').map(s => s.trim()).filter(Boolean)
      : []
    if (applicableTo.length === 0) throw new Error(`EXPENSES: applicableTo is empty for "${r.name}"`)
    return { id: r.id, name: r.name, date: r.date, amount, paidById: r.paidById, applicableTo }
  })

  const additionalPayments = pRows.map(r => {
    const amount = parseFloat(r.amount)
    if (isNaN(amount) || amount <= 0) throw new Error(`PAYMENTS: invalid amount "${r.amount}"`)
    if (r.fromId === r.toId) throw new Error(`PAYMENTS: fromId and toId must differ`)
    return { id: r.id, fromId: r.fromId, toId: r.toId, amount, date: r.date }
  })

  return { travelers, expenses, additionalPayments }
}
