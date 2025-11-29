import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import api from '../services/api'

const TrackPage = () => {
  const { scheduleId } = useParams()
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 })  // Bangalore default
  const [speed, setSpeed] = useState(0)
  const [loading, setLoading] = useState(true)

  // Custom bus icon (blue circle)
  const busIcon = L.divIcon({
    html: '<div style="background: #1a237e; height: 20px; width: 20px; border-radius: 50%; border: 2px solid white;"></div>',
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

  useEffect(() => {
    fetchLocation()
    // Mock location update every 5 sec
    const interval = setInterval(() => {
      setLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }))
      setSpeed(Math.random() * 20 + 30)
    }, 5000)
    return () => clearInterval(interval)
  }, [scheduleId])

  const fetchLocation = async () => {
    try {
      const response = await api.get(`/schedules/${scheduleId}`)
      const data = response.data
      if (data.currentLat && data.currentLng) {
        setLocation({ lat: data.currentLat, lng: data.currentLng })
      }
    } catch (err) {
      console.error('Failed to fetch location')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-white">Loading map...</div>

  return (
    <div className="flex flex-col h-screen relative">  {/* FIXED: relative + h-screen */}
      {/* Header */}
      <div className="bg-[#1a237e] p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Live Bus Tracking</h1>
        <div className="text-right">
          <p className="text-gray-300">Speed: {speed} km/h</p>
          <p className="text-white font-semibold">ETA: 15 min</p>
        </div>
      </div>

      {/* Map – Full height */}
      <div className="flex-1 relative h-full">  {/* FIXED: relative + h-full */}
        <MapContainer center={location} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={location} icon={busIcon}>
            <Popup>
              Bus Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}<br />
              Speed: {speed} km/h
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  )
}

export default TrackPage