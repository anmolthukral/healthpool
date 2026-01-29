import React from 'react'

function distanceKm(lat1, lon1, lat2, lon2) {
  if (!lat2 || !lon2) return null
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function HospitalsList({ hospitals, loading, position }) {
  if (loading) return <div className="loading">Searching nearby hospitals…</div>
  if (!hospitals || hospitals.length === 0) return <div className="empty">No hospitals found nearby.</div>

  const withDist = hospitals
    .map((h) => ({ ...h, dist: distanceKm(position.lat, position.lon, h.lat, h.lon) }))
    .sort((a, b) => (a.dist ?? 999) - (b.dist ?? 999))

  return (
    <div className="hospitals-list">
      {withDist.map((h) => (
        <div key={h.id} className="hospital">
          <div className="hospital-name">{h.name}</div>
          <div className="hospital-meta">
            {h.addr && <span className="addr">{h.addr}</span>}
            {h.dist != null && <span className="dist">{h.dist.toFixed(2)} km</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
