import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Call your backend API
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password,
      })

      // Save token to localStorage
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))

      // Navigate to home
      navigate('/home')
    } catch (err) {
      setError(err.response?.data || 'Login failed – check credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="FlashSeat Logo" className="h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#1a237e]">FlashSeat</h1>
          <p className="text-gray-400">College Bus Seat Booking</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Student ID</label>
            <input
              type="text"
              placeholder="e.g., CSE21001"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg font-semibold"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-6 text-gray-400">
          <p>Don't have an account? <span className="text-[#1a237e]">Contact admin</span></p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage