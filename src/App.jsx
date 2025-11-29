import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import logo from './assets/logo.png'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import MyBookingsPage from './pages/MyBookingsPage'
import TrackPage from './pages/TrackPage'
import DriverPage from './pages/DriverPage'

// Protected Route Component (JWT check)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  return token ? children : null
}

// Navbar Component
const Navbar = () => {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (!token) return null  // Hide navbar on login page

  return (
    <header className="bg-[#1a237e] p-4 flex justify-between items-center">
      <img src={logo} alt="FlashSeat Logo" className="h-12" />
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold text-white">FlashSeat</h1>
        <span className="text-white">Welcome, {user.username}</span>
        <button onClick={() => navigate('/my-bookings')} className="text-white hover:text-gray-300">
          My Bookings
        </button>
        <button onClick={handleLogout} className="text-white hover:text-gray-300">
          Logout
        </button>
      </div>
    </header>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
        <Toaster />
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          } />
          <Route path="/track/:scheduleId" element={
            <ProtectedRoute>
              <TrackPage />
            </ProtectedRoute>
          } />
          <Route path="/driver/:busId" element={<DriverPage />} />
        </Routes>
        <footer className="bg-[#1a237e] p-4 text-center text-sm text-white mt-auto">
          FlashSeat – Made for [Your College] Students © 2025
        </footer>
      </div>
    </Router>
  )
}

export default App