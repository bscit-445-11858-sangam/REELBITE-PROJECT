import React from 'react'
import { useLocation } from 'react-router-dom'

import './App.css'
import './styles/theme.css'
import AppRoutes from './routes/AppRoutes'
import BottomNav from './components/bottomNav'

function App() {
  const { pathname } = useLocation()
  const hideBottomNavRoutes = ['/user/login', '/user/register', '/food-partner/login', '/food-partner/register']
  const shouldHideBottomNav = hideBottomNavRoutes.includes(pathname)

  return (
    <>
      <AppRoutes />
      {!shouldHideBottomNav && <BottomNav />}
    </>
  )
}

export default App