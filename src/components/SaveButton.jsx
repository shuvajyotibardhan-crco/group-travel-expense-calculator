import React from 'react'
import { useTripStore } from '../state/useTripStore.jsx'
import { exportCsv } from '../io/csvExporter.js'
import './SaveButton.css'

export default function SaveButton() {
  const { state } = useTripStore()

  function handleSave() {
    exportCsv({
      travelers: state.travelers,
      expenses: state.expenses,
      additionalPayments: state.additionalPayments,
    })
  }

  return (
    <button className="btn-save-csv" onClick={handleSave}>
      Save to CSV
    </button>
  )
}
