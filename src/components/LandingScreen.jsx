import React, { useRef, useState } from 'react'
import { useTripStore } from '../state/useTripStore.jsx'
import { parseCsv } from '../io/csvParser.js'
import './LandingScreen.css'

export default function LandingScreen() {
  const { dispatch } = useTripStore()
  const fileRef = useRef(null)
  const [error, setError] = useState('')

  function handleNewTrip() {
    dispatch({ type: 'RESET' })
    dispatch({ type: 'SET_SCREEN', payload: 'travelerSetup' })
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const state = parseCsv(ev.target.result)
        dispatch({ type: 'LOAD_CSV', payload: state })
      } catch (err) {
        setError(err.message || 'Invalid CSV file.')
        fileRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="landing">
      <div className="landing-card">
        <h1>Group Travel Expense Calculator</h1>
        <p className="landing-subtitle">Track shared expenses and settle up easily.</p>
        <div className="landing-actions">
          <button className="btn-primary" onClick={handleNewTrip}>New Trip</button>
          <button className="btn-secondary" onClick={() => fileRef.current.click()}>
            Load from CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
        {error && <p className="error-banner">{error}</p>}
      </div>
    </div>
  )
}
