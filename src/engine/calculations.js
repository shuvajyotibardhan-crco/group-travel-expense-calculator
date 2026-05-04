import { ZERO_THRESHOLD } from '../constants.js'

export function allocateExpense(amount, applicableTravelerIds, allTravelers) {
  const n = applicableTravelerIds.length
  if (n === 0) return {}

  const sorted = [...applicableTravelerIds].sort((a, b) => {
    const na = allTravelers.find(t => t.id === a)?.nickname ?? ''
    const nb = allTravelers.find(t => t.id === b)?.nickname ?? ''
    return na.localeCompare(nb)
  })

  const totalCents = Math.round(amount * 100)
  const baseCents = Math.floor(totalCents / n)
  const remainder = totalCents - baseCents * n

  const result = {}
  sorted.forEach((id, i) => {
    const cents = baseCents + (i < remainder ? 1 : 0)
    result[id] = Math.round(cents) / 100
  })
  return result
}

export function computeBalances(travelers, expenses, additionalPayments) {
  const balanceMap = {}
  travelers.forEach(t => { balanceMap[t.id] = 0 })

  expenses.forEach(expense => {
    const splits = allocateExpense(expense.amount, expense.applicableTo, travelers)
    Object.entries(splits).forEach(([tid, share]) => {
      balanceMap[tid] = (balanceMap[tid] ?? 0) - share
    })
    balanceMap[expense.paidById] = (balanceMap[expense.paidById] ?? 0) + expense.amount
  })

  additionalPayments.forEach(p => {
    balanceMap[p.fromId] = (balanceMap[p.fromId] ?? 0) + p.amount
    balanceMap[p.toId]   = (balanceMap[p.toId]   ?? 0) - p.amount
  })

  return balanceMap
}

export function settle(balanceMap, travelers) {
  const nicknameOf = id => travelers.find(t => t.id === id)?.nickname ?? id

  const payers = Object.entries(balanceMap)
    .filter(([, net]) => net < -ZERO_THRESHOLD)
    .map(([id, net]) => ({ id, net }))
    .sort((a, b) => a.net - b.net)

  const receivers = Object.entries(balanceMap)
    .filter(([, net]) => net > ZERO_THRESHOLD)
    .map(([id, net]) => ({ id, net }))
    .sort((a, b) => a.net - b.net)

  const transfers = []

  while (payers.length > 0 && receivers.length > 0) {
    const p = payers[0]
    const r = receivers[0]
    const transferAmount = Math.min(Math.abs(p.net), r.net)
    const rounded = Math.round(transferAmount * 100) / 100

    transfers.push({ from: nicknameOf(p.id), to: nicknameOf(r.id), amount: rounded })

    p.net += transferAmount
    r.net -= transferAmount

    if (Math.abs(p.net) < ZERO_THRESHOLD) payers.shift()
    if (r.net < ZERO_THRESHOLD) receivers.shift()
  }

  return transfers
}
