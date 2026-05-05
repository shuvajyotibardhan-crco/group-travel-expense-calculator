import Papa from 'papaparse'
import {
  CSV_SECTION_TRAVELERS,
  CSV_SECTION_EXPENSES,
  CSV_SECTION_PAYMENTS,
  CSV_FILENAME_PREFIX,
} from '../constants.js'

export async function exportCsv({ travelers, expenses, additionalPayments }) {
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

  // File System Access API — lets user pick folder and filename (Chrome/Edge)
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'CSV file', accept: { 'text/csv': ['.csv'] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (err) {
      if (err.name === 'AbortError') return  // user cancelled picker
      // fall through to next method
    }
  }

  // Web Share API — shows OS share sheet on iOS/Android (iCloud Files, Drive app, etc.)
  const file = new File([blob], filename, { type: 'text/csv' })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return
    } catch (err) {
      if (err.name === 'AbortError') return  // user cancelled share sheet
      // fall through to fallback
    }
  }

  // Fallback — auto-download to default Downloads folder
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
