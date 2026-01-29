import React, { useEffect, useState } from 'react'

import HospitalsList from './components/HospitalsList'

const fetchOverpass = async (lat, lon, radius = 2000) => {
  // Overpass QL: find amenity=hospital within radius (meters)
  const q = `[out:json];(node[amenity=hospital](around:${radius},${lat},${lon});way[amenity=hospital](around:${radius},${lat},${lon});relation[amenity=hospital](around:${radius},${lat},${lon}););out center;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Overpass request failed')
  const data = await res.json()
  return data.elements || []
}

export default function App() {
  const [position, setPosition] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => setError(err.message)
    )
  }, [])

  useEffect(() => {
    if (!position) return
    setLoading(true)
    setError(null)
    fetchOverpass(position.lat, position.lon)
      .then((els) => {
        // normalize elements to have name and coords
        const items = els.map((e) => {
          const name = (e.tags && (e.tags.name || e.tags['official_name'])) || 'Unnamed Hospital'
          const lat = e.lat ?? (e.center && e.center.lat)
          const lon = e.lon ?? (e.center && e.center.lon)
          const addr = e.tags && (e.tags['addr:full'] || e.tags['addr:street'] || e.tags['addr:housenumber'])
          return { id: e.id, name, lat, lon, addr }
        })
        setHospitals(items)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [position])

  return (
    <div className="app">
      <header className="app-header">
        <h1>HealthPool</h1>
        <p className="subtitle">Nearby hospitals around your current location</p>
      </header>

      <main className="container">
        {error && <div className="error">{error}</div>}
        {!position && !error && <div className="info">Getting your location…</div>}
        {position && (
          <div className="map-and-list">
            <div className="map-placeholder">Map preview (optional)</div>
            <HospitalsList hospitals={hospitals} loading={loading} position={position} />
          </div>
        )}
      </main>

      <footer className="footer">OpenStreetMap · Overpass API · No API keys required</footer>
    </div>
  )
}
