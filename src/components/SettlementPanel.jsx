import React, { useState } from 'react'
import { useTripStore } from '../state/useTripStore.jsx'
import { computeBalances, settle } from '../engine/calculations.js'
import './SettlementPanel.css'

export default function SettlementPanel() {
  const { state } = useTripStore()
  const { travelers, expenses, additionalPayments } = state
  const [transfers, setTransfers] = useState(null)
  const [settled, setSettled] = useState(false)

  function handleSettle() {
    const balanceMap = computeBalances(travelers, expenses, additionalPayments)
    const result = settle(balanceMap, travelers)
    setTransfers(result)
    setSettled(result.length === 0)
  }

  return (
    <section className="section-card settlement-panel">
      <h2>Settlement</h2>
      <button className="btn-settle" onClick={handleSettle}>Settle</button>

      {transfers !== null && (
        <div className="settlement-result">
          {settled ? (
            <p className="settled-msg">Everyone is settled — no transfers needed.</p>
          ) : (
            <ol className="transfer-list">
              {transfers.map((t, i) => (
                <li key={i}>
                  <strong>{t.from}</strong> pays <strong>{t.to}</strong> ${t.amount.toFixed(2)}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  )
}
