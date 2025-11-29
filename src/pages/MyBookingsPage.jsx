import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { getMyBookings } from '../services/api'

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('upcoming')
  const navigate = useNavigate()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    console.log("DEBUG: fetchBookings called!")
    try {
      console.log("DEBUG: Calling API with token:", localStorage.getItem('token') ? 'Token present' : 'No token')
      const response = await getMyBookings()
      console.log("DEBUG: API response:", response.data)
      setBookings(response.data)
    } catch (err) {
      console.error("DEBUG: API error:", err.response || err.message)
      if (err.response?.status === 401) {
        // FIXED: Token expired – relogin
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        setError('Failed to load bookings')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTrackBus = (booking) => {
    const scheduleId = booking.schedule?.id
    if (scheduleId) {
      navigate(`/track/${scheduleId}`)
    } else {
      alert('Schedule ID not available – contact admin')
    }
  }

  const handleCancel = async (bookingId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`)
      console.log("Cancel response:", response.data)
      fetchBookings()  // FIXED: Refresh list
      if (activeTab === 'upcoming') {
        setActiveTab('cancelled')
      }
    } catch (err) {
      const errorMsg = err.response?.data || 'Cancel failed'
      console.error("Cancel error:", errorMsg)
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        alert(errorMsg)
      }
    }
  }

  // Filter bookings by tab (less strict for mock)
  const filteredBookings = bookings.filter(booking => {
    const now = new Date()
    const bookingDate = new Date(booking.tripDate)
    const isFuture = bookingDate >= now
    const isPast = bookingDate < now || booking.status === "COMPLETED"

    switch (activeTab) {
      case 'upcoming':
        return booking.status === "CONFIRMED" && isFuture
      case 'cancelled':
        return booking.status === "CANCELLED"
      case 'past':
        return isPast || booking.status === "COMPLETED"
      default:
        return false
    }
  })

  if (loading) return <div className="p-8 text-center">Loading bookings...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#1a237e] mb-8">My Bookings</h1>

      <button onClick={() => navigate('/home')} className="btn-primary mb-6">
        Book New Seat
      </button>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex space-x-4 mb-6 border-b border-[#1a237e]">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`pb-2 px-4 ${activeTab === 'upcoming' ? 'border-b-2 border-[#1a237e] text-[#1a237e]' : 'text-gray-300'}`}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setActiveTab('cancelled')}
          className={`pb-2 px-4 ${activeTab === 'cancelled' ? 'border-b-2 border-[#1a237e] text-[#1a237e]' : 'text-gray-300'}`}
        >
          Cancelled
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={`pb-2 px-4 ${activeTab === 'past' ? 'border-b-2 border-[#1a237e] text-[#1a237e]' : 'text-gray-300'}`}
        >
          Past
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <p className="text-gray-300">No bookings in this tab.</p>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="bg-[#1a237e]/20 p-6 rounded-lg border-l-4 border-[#1a237e] transition-opacity duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">{booking.tripDate} – {booking.tripType} Trip</h3>
                  <p className="text-gray-300">Bus: {booking.busNumber} | Route: {booking.routeName}</p>
                  <p className="text-gray-300">Seat: {booking.seatNumber} | Status: {booking.status}</p>
                </div>
                <div className="space-x-2">
                  {booking.status === "CONFIRMED" && (
                    <>
                      <button className="btn-primary px-4 py-2">Download Ticket</button>
                      <button onClick={() => handleTrackBus(booking)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                        Track Bus
                      </button>
                      <button onClick={() => handleCancel(booking.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookingsPage