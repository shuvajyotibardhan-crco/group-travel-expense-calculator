import React, { useState } from 'react'
import { useTripStore } from '../state/useTripStore.jsx'
import { allocateExpense } from '../engine/calculations.js'
import './ExpenseManager.css'

function uuid() { return crypto.randomUUID() }

const emptyForm = { name: '', date: '', amount: '', paidById: '', applicableTo: [] }

export default function ExpenseManager() {
  const { state, dispatch } = useTripStore()
  const { travelers, expenses } = state
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  function handleCheckbox(id) {
    setForm(f => ({
      ...f,
      applicableTo: f.applicableTo.includes(id)
        ? f.applicableTo.filter(x => x !== x === id)
        : [...f.applicableTo, id],
    }))
  }

  function toggleApplicable(id) {
    setForm(f => ({
      ...f,
      applicableTo: f.applicableTo.includes(id)
        ? f.applicableTo.filter(x => x !== id)
        : [...f.applicableTo, id],
    }))
  }

  function validate() {
    if (!form.name.trim()) return 'Expense name is required.'
    if (!form.date) return 'Date is required.'
    const amt = parseFloat(form.amount)
    if (isNaN(amt) || amt <= 0) return 'Amount must be a positive number.'
    if (!form.paidById) return 'Please select who paid.'
    if (form.applicableTo.length === 0) return 'Select at least one traveler this applies to.'
    return ''
  }

  function handleSave() {
    const err = validate()
    if (err) { setError(err); return }
    const expense = {
      id: editId ?? uuid(),
      name: form.name.trim(),
      date: form.date,
      amount: Math.round(parseFloat(form.amount) * 100) / 100,
      paidById: form.paidById,
      applicableTo: form.applicableTo,
    }
    dispatch({ type: editId ? 'EDIT_EXPENSE' : 'ADD_EXPENSE', payload: expense })
    setForm(emptyForm)
    setEditId(null)
    setError('')
  }

  function handleEdit(expense) {
    setForm({
      name: expense.name,
      date: expense.date,
      amount: String(expense.amount),
      paidById: expense.paidById,
      applicableTo: [...expense.applicableTo],
    })
    setEditId(expense.id)
    setError('')
  }

  function handleDelete(id) {
    dispatch({ type: 'DELETE_EXPENSE', payload: id })
    if (editId === id) { setForm(emptyForm); setEditId(null) }
  }

  function handleCancel() {
    setForm(emptyForm); setEditId(null); setError('')
  }

  // Running totals per traveler
  const sharesOwed = {}
  const amountsPaid = {}
  travelers.forEach(t => { sharesOwed[t.id] = 0; amountsPaid[t.id] = 0 })
  expenses.forEach(e => {
    const splits = allocateExpense(e.amount, e.applicableTo, travelers)
    Object.entries(splits).forEach(([tid, share]) => { sharesOwed[tid] += share })
    amountsPaid[e.paidById] += e.amount
  })

  const nicknameOf = id => travelers.find(t => t.id === id)?.nickname ?? id

  return (
    <section className="section-card">
      <h2>Expenses</h2>

      <div className="expense-form">
        <div className="form-row">
          <label>Expense Name
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Hotel night 1"
            />
          </label>
          <label>Date
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
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
          <label>Paid By
            <select
              value={form.paidById}
              onChange={e => setForm(f => ({ ...f, paidById: e.target.value }))}
            >
              <option value="">-- select --</option>
              {travelers.map(t => (
                <option key={t.id} value={t.id}>{t.nickname}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="checkbox-group">
          <span className="checkbox-label">Applicable To:</span>
          {travelers.map(t => (
            <label key={t.id} className="checkbox-item">
              <input
                type="checkbox"
                checked={form.applicableTo.includes(t.id)}
                onChange={() => toggleApplicable(t.id)}
              />
              {t.nickname}
            </label>
          ))}
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="form-actions">
          <button className="btn-save" onClick={handleSave}>
            {editId ? 'Update Expense' : 'Add Expense'}
          </button>
          {editId && <button className="btn-cancel" onClick={handleCancel}>Cancel</button>}
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Paid By</th>
                <th>Applicable To</th>
                {travelers.map(t => <th key={t.id}>{t.nickname}<br /><small>Share</small></th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => {
                const splits = allocateExpense(e.amount, e.applicableTo, travelers)
                return (
                  <tr key={e.id}>
                    <td>{e.name}</td>
                    <td>{e.date}</td>
                    <td>${e.amount.toFixed(2)}</td>
                    <td>{nicknameOf(e.paidById)}</td>
                    <td>{e.applicableTo.map(nicknameOf).join(', ')}</td>
                    {travelers.map(t => (
                      <td key={t.id} className="num-cell">
                        {splits[t.id] != null ? `$${splits[t.id].toFixed(2)}` : '—'}
                      </td>
                    ))}
                    <td className="action-cell">
                      <button className="btn-edit" onClick={() => handleEdit(e)}>Edit</button>
                      <button className="btn-del" onClick={() => handleDelete(e.id)}>Del</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td colSpan={5}><strong>Running Totals</strong></td>
                {travelers.map(t => (
                  <td key={t.id} className="num-cell">
                    <div><small>Owed:</small> ${sharesOwed[t.id].toFixed(2)}</div>
                    <div><small>Paid:</small> ${amountsPaid[t.id].toFixed(2)}</div>
                  </td>
                ))}
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  )
}
