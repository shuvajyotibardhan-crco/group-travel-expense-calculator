import React, { createContext, useContext, useReducer } from 'react'

const initialState = {
  screen: 'landing',
  travelers: [],
  expenses: [],
  additionalPayments: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload }

    case 'ADD_TRAVELER':
      return { ...state, travelers: [...state.travelers, action.payload] }

    case 'REMOVE_TRAVELER':
      return { ...state, travelers: state.travelers.filter(t => t.id !== action.payload) }

    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] }

    case 'EDIT_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e),
      }

    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) }

    case 'ADD_PAYMENT':
      return { ...state, additionalPayments: [...state.additionalPayments, action.payload] }

    case 'EDIT_PAYMENT':
      return {
        ...state,
        additionalPayments: state.additionalPayments.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      }

    case 'DELETE_PAYMENT':
      return {
        ...state,
        additionalPayments: state.additionalPayments.filter(p => p.id !== action.payload),
      }

    case 'LOAD_CSV':
      return { ...action.payload, screen: 'main' }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}

const TripContext = createContext(null)

export function TripProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <TripContext.Provider value={{ state, dispatch }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTripStore() {
  return useContext(TripContext)
}
