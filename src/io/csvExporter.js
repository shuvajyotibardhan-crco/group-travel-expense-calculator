import Papa from 'papaparse'
import {
  CSV_SECTION_TRAVELERS,
  CSV_SECTION_EXPENSES,
  CSV_SECTION_PAYMENTS,
  CSV_FILENAME_PREFIX,
} from '../constants.js'

export function exportCsv({ travelers, expenses, additionalPayments }) {
  const tCsv = Papa.unparse(travelers)
  const eCsv = Papa.unparse(
    expenses.map(e => ({ ...e, applicableTo: e.applicableTo.join(',') }))
  )
  const pCsv = Papa.unparse(additionalPayments)

  const content = [
    CSV_SECTION_TRAVELERS, tCsv,
    CSV_SECTION_EXPENSES, eCsv,
    CSV_SECTION_PAYMENTS, pCsv,
  ].join('\n')

  const date = new Date().toISOString().slice(0, 10)
  const filename = `${CSV_FILENAME_PREFIX}${date}.csv`

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
