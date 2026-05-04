import React from 'react'
import { TripProvider, useTripStore } from './state/useTripStore.jsx'
import LandingScreen from './components/LandingScreen.jsx'
import TravelerSetup from './components/TravelerSetup.jsx'
import ExpenseManager from './components/ExpenseManager.jsx'
import PaymentsManager from './components/PaymentsManager.jsx'
import SettlementPanel from './components/SettlementPanel.jsx'
import SaveButton from './components/SaveButton.jsx'
import './App.css'

function AppContent() {
  const { state, dispatch } = useTripStore()
  const { screen, travelers, expenses } = state

  if (screen === 'landing') {
    return <LandingScreen />
  }

  if (screen === 'travelerSetup') {
    return <TravelerSetup />
  }

  return (
    <div className="main-layout">
      <header className="app-header">
        <h1>Group Travel Expense Calculator</h1>
        <SaveButton />
      </header>
      <main className="app-main">
        <ExpenseManager />
        <PaymentsManager />
        {expenses.length > 0 && <SettlementPanel />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <TripProvider>
      <AppContent />
    </TripProvider>
  )
}
