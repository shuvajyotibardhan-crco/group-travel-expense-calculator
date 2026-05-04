import React, { useState } from 'react'
import { useTripStore } from '../state/useTripStore.jsx'
import './PaymentsManager.css'

function uuid() { return crypto.randomUUID() }

const emptyForm = { fromId: '', toId: '', amount: '', date: '' }

export default function PaymentsManager() {
  const { state, dispatch } = useTripStore()
  const { travelers, additionalPayments } = state
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  function validate() {
    if (!form.fromId) return 'Select who paid.'
    if (!form.toId) return 'Select who received.'
    if (form.fromId === form.toId) return 'From and To must be different travelers.'
    const amt = parseFloat(form.amount)
    if (isNaN(amt) || amt <= 0) return 'Amount must be a positive number.'
    if (!form.date) return 'Date is required.'
    return ''
  }

  function handleSave() {
    const err = validate()
    if (err) { setError(err); return }
    const payment = {
      id: editId ?? uuid(),
      fromId: form.fromId,
      toId: form.toId,
      amount: Math.round(parseFloat(form.amount) * 100) / 100,
      date: form.date,
    }
    dispatch({ type: editId ? 'EDIT_PAYMENT' : 'ADD_PAYMENT', payload: payment })
    setForm(emptyForm); setEditId(null); setError('')
  }

  function handleEdit(p) {
    setForm({ fromId: p.fromId, toId: p.toId, amount: String(p.amount), date: p.date })
    setEditId(p.id); setError('')
  }

  function handleDelete(id) {
    dispatch({ type: 'DELETE_PAYMENT', payload: id })
    if (editId === id) { setForm(emptyForm); setEditId(null) }
  }

  function handleCancel() { setForm(emptyForm); setEditId(null); setError('') }

  const nicknameOf = id => travelers.find(t => t.id === id)?.nickname ?? id

  return (
    <section className="section-card">
      <h2>Additional Payments</h2>

      <div className="payment-form">
        <div className="form-row">
          <label>From
            <select value={form.fromId} onChange={e => setForm(f => ({ ...f, fromId: e.target.value }))}>
              <option value="">-- select --</option>
              {travelers.map(t => <option key={t.id} value={t.id}>{t.nickname}</option>)}
            </select>
          </label>
          <label>To
            <select value={form.toId} onChange={e => setForm(f => ({ ...f, toId: e.target.value }))}>
              <option value="">-- select --</option>
              {travelers.map(t => <option key={t.id} value={t.id}>{t.nickname}</option>)}
            </select>
          </label>
          <label>Amount (USD)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
            />
          </label>
          <label>Date
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </label>
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="form-actions">
          <button className="btn-save" onClick={handleSave}>
            {editId ? 'Update Payment' : 'Add Payment'}
          </button>
          {editId && <button className="btn-cancel" onClick={handleCancel}>Cancel</button>}
        </div>
      </div>

      {additionalPayments.length > 0 && (
        <div className="table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {additionalPayments.map(p => (
                <tr key={p.id}>
                  <td>{nicknameOf(p.fromId)}</td>
                  <td>{nicknameOf(p.toId)}</td>
                  <td>${p.amount.toFixed(2)}</td>
                  <td>{p.date}</td>
                  <td className="action-cell">
                    <button className="btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="btn-del" onClick={() => handleDelete(p.id)}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
