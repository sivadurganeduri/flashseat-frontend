import { useState, useEffect } from 'react'
import api from '../services/api'
import { bookSeat } from '../services/api'  // Import exported function

const HomePage = () => {
  const [buses, setBuses] = useState([])
  const [seats, setSeats] = useState([])
  const [selectedBus, setSelectedBus] = useState(null)
  const [showSeatMap, setShowSeatMap] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedSeats, setSelectedSeats] = useState([])

  // Get user gender from localStorage for disable
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userGender = user?.gender || 'MALE'

  useEffect(() => {
    fetchBuses()
  }, [])

  const fetchBuses = async () => {
    try {
      const response = await api.get('/buses')
      setBuses(response.data)
    } catch (err) {
      console.error('Failed to fetch buses')
      // Fallback mock buses (4 buses)
      setBuses([
        {
          id: 'mock1',
          busNumber: "TN07 AB1234",
          routeName: "College → Girls Hostel",
          totalSeats: 50
        },
        {
          id: 'mock2',
          busNumber: "TN07 AC5678",
          routeName: "College → Boys Hostel",
          totalSeats: 50
        },
        {
          id: 'mock3',
          busNumber: "TN07 AD9012",
          routeName: "College → Library",
          totalSeats: 50
        },
        {
          id: 'mock4',
          busNumber: "TN07 AE3456",
          routeName: "College → Canteen",
          totalSeats: 50
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const openSeatMap = (bus) => {
    // Force mock seats – all 50 visible
    const mockSeats = []
    for (let i = 1; i <= 50; i++) {
      mockSeats.push({
        id: `mock-${i}`,
        seatNumber: i,
        isLadiesSeat: i <= 24,
        isBooked: false,
        bookedByStudentId: null,
        bookedByName: null
      })
    }
    setSeats(mockSeats)
    setSelectedBus(bus)
    setShowSeatMap(true)
  }

  const closeSeatMap = () => {
    setShowSeatMap(false)
    setSelectedSeats([])
  }

  const toggleSeat = (seat) => {
    // Gender disable
    const isOppositeGender = (seat.isLadiesSeat && userGender !== 'FEMALE') || (!seat.isLadiesSeat && userGender !== 'MALE')
    if (seat.isBooked || isOppositeGender) return

    setSelectedSeats(prev => {
      if (prev.some(s => s.id === seat.id)) {
        return prev.filter(s => s.id !== seat.id)
      } else {
        return [...prev, seat]
      }
    })
  }

  const bookSelectedSeats = async () => {
    if (selectedSeats.length === 0) {
      alert('Select at least one seat')
      return
    }

    try {
      const mockScheduleId = '692a932bd0290b19338a4cf1'  // FIXED: Use your current from Postman/Console
      console.log("DEBUG: Booking body:", { scheduleId: mockScheduleId, seatNumber: selectedSeats[0].seatNumber })  // FIXED: Debug body
      for (const seat of selectedSeats) {
        await bookSeat({  // FIXED: Call exported function
          scheduleId: mockScheduleId,
          seatNumber: seat.seatNumber 
        })
      }
      alert(`${selectedSeats.length} seat(s) booked successfully on ${selectedBus.busNumber}!`)
      closeSeatMap()
      window.location.href = '/my-bookings'  // FIXED: Refresh My Bookings
    } catch (err) {
      console.error('Booking error:', err.response?.data || err.message)  // FIXED: Log full error
      alert(err.response?.data || 'Booking failed')
    }
  }

  if (loading) return <div className="p-8 text-center">Loading buses...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#1a237e] mb-8">Bus Selection</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buses.map(bus => (
          <div key={bus.id} className="bg-[#1a237e]/20 p-6 rounded-lg cursor-pointer hover:bg-[#1a237e]/30 transition-colors">
            <h3 className="text-xl font-semibold mb-2">{bus.busNumber}</h3>
            <p className="text-gray-300 mb-1">{bus.routeName}</p>
            <p className="text-gray-300 mb-4">{bus.totalSeats} seats | Ladies Rows 1-6</p>
            <button onClick={() => openSeatMap(bus)} className="btn-primary w-full">
              Select Seats
            </button>
          </div>
        ))}
      </div>

      {/* Seat Map Modal – All 50 Seats Visible */}
      {showSeatMap && selectedBus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1a237e]">Select Seat – {selectedBus.busNumber}</h2>
              <button onClick={closeSeatMap} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-pink-400">Ladies Section (Pink – Rows 1-6)</h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {seats.slice(0, 24).map(seat => (
                  <button
                    key={seat.id}
                    className={`w-12 h-12 rounded text-xs font-bold ${
                      seat.isBooked ? 'bg-white text-black' :  // White for booked
                      (seat.isLadiesSeat && userGender !== 'FEMALE') ? 'bg-gray-500 text-gray-300 cursor-not-allowed' :  // Gray disabled
                      selectedSeats.some(s => s.id === seat.id) ? 'bg-pink-300 text-white' : 'bg-[#1a237e]/50 backdrop-blur-sm text-white hover:bg-[#1a237e]/70'  // Blurry navy available
                    }`}
                    disabled={seat.isBooked || (seat.isLadiesSeat && userGender !== 'FEMALE')}
                    onClick={() => toggleSeat(seat)}
                    title={seat.isBooked ? `${seat.bookedByStudentId}\n${seat.bookedByName}` : ''}  // Hover tooltip
                  >
                    {seat.seatNumber}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-400">Gents Section (Blue – Rows 7-12)</h3>
              <div className="grid grid-cols-4 gap-2">
                {seats.slice(24).map(seat => (
                  <button
                    key={seat.id}
                    className={`w-12 h-12 rounded text-xs font-bold ${
                      seat.isBooked ? 'bg-white text-black' :  // White for booked
                      (!seat.isLadiesSeat && userGender !== 'MALE') ? 'bg-gray-500 text-gray-300 cursor-not-allowed' :  // Gray disabled
                      selectedSeats.some(s => s.id === seat.id) ? 'bg-blue-300 text-white' : 'bg-[#1a237e]/50 backdrop-blur-sm text-white hover:bg-[#1a237e]/70'  // Blurry navy available
                    }`}
                    disabled={seat.isBooked || (!seat.isLadiesSeat && userGender !== 'MALE')}
                    onClick={() => toggleSeat(seat)}
                    title={seat.isBooked ? `${seat.bookedByStudentId}\n${seat.bookedByName}` : ''}  // Hover tooltip
                  >
                    {seat.seatNumber}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-300">Selected: {selectedSeats.length} seats</p>
              <button onClick={bookSelectedSeats} className="btn-primary px-6 py-2" disabled={selectedSeats.length === 0}>
                Book Selected Seat(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage