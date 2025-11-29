import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

const DriverPage = () => {
  const { busId } = useParams()
  const [location, setLocation] = useState(null)
  const [status, setStatus] = useState('Not started')
  const [watchId, setWatchId] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('Geolocation not supported')
      return
    }

    const startSharing = () => {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(newLocation)
          updateLocation(newLocation)
          setStatus('Sharing live')
        },
        (error) => {
          setStatus('Location error: ' + error.message)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
      setWatchId(id)
    }

    startSharing()

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [busId])

  const updateLocation = async (loc) => {
    try {
      const mockScheduleId = '6929622827661616744b3e39'  // Your current from console/Postman
      await api.put(`/schedules/${mockScheduleId}/location`, loc)
      console.log('Location updated:', loc)
    } catch (err) {
      console.error('Failed to update location:', err)
      setStatus('Update failed')
    }
  }

  const stopSharing = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
    }
    setStatus('Stopped')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-[#1a237e] mb-4">Driver Tracking</h1>
      <p className="mb-4 text-gray-300">Bus: {busId}</p>
      <p className="text-lg mb-8" style={{ color: status === 'Sharing live' ? 'green' : status === 'Stopped' ? 'orange' : 'red' }}>
        Status: {status}
      </p>
      {location && (
        <p className="text-sm text-gray-300 mb-8">
          Current: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      )}
      <button onClick={stopSharing} className="btn-primary px-8 py-3">
        Stop Sharing
      </button>
      <p className="text-xs text-gray-500 mt-4">Keep this page open while driving</p>
    </div>
  )
}

export default DriverPage