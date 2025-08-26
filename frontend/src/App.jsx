// App.js
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Register from './pages/register'
import Home from './pages/Home'
import Login from './pages/login'
import Layout from './components/Layout'
import Profile from './pages/Profile'
import DashBoard from './pages/DashBoard'
import { AuthProvider } from './components/AuthProvider'
import NotFound from './pages/NotFound'
import AppRoutes from './AppRoutes' // Create this component
import {store, persistor} from './store/store'
import { PersistGate } from 'redux-persist/integration/react'
import {Provider} from 'react-redux'
const App = () => {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
    </PersistGate>
    </Provider>
  )
}

export default App