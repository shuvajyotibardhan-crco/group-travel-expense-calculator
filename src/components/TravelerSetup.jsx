import React, { useState } from 'react'
import { useTripStore } from '../state/useTripStore.jsx'
import './TravelerSetup.css'

function uuid() { return crypto.randomUUID() }

export default function TravelerSetup() {
  const { state, dispatch } = useTripStore()
  const { travelers, expenses } = state
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')

  function handleAdd() {
    const trimmed = nickname.trim()
    if (!trimmed) { setError('Nickname cannot be blank.'); return }
    if (travelers.some(t => t.nickname.toLowerCase() === trimmed.toLowerCase())) {
      setError('That nickname is already in use.'); return
    }
    dispatch({ type: 'ADD_TRAVELER', payload: { id: uuid(), nickname: trimmed } })
    setNickname('')
    setError('')
  }

  function handleRemove(id) {
    dispatch({ type: 'REMOVE_TRAVELER', payload: id })
  }

  function handleDone() {
    dispatch({ type: 'SET_SCREEN', payload: 'main' })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="setup-wrapper">
      <div className="setup-card">
        <h2>Who's on this trip?</h2>
        <p className="setup-subtitle">Add a nickname for each traveler.</p>
        <div className="setup-input-row">
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={40}
          />
          <button className="btn-add" onClick={handleAdd}>Add</button>
        </div>
        {error && <p className="field-error">{error}</p>}
        <ul className="traveler-list">
          {travelers.map(t => (
            <li key={t.id}>
              <span>{t.nickname}</span>
              <button
                className="btn-remove"
                onClick={() => handleRemove(t.id)}
                disabled={expenses.length > 0}
                title={expenses.length > 0 ? 'Cannot remove after expenses are added' : 'Remove'}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        {travelers.length >= 2 && (
          <button className="btn-done" onClick={handleDone}>
            Done — Add Expenses
          </button>
        )}
      </div>
    </div>
  )
}
