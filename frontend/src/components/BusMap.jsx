import { useEffect } from 'react'
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'

export const NED_CENTER = [24.9329, 67.1114]

function busIcon(label, live) {
  return L.divIcon({
    className: `bus-marker ${live ? '' : 'offline'}`,
    html: `<div>🚌 ${label}</div>`,
    iconSize: null,
    iconAnchor: [30, 12],
  })
}

// Moves the map to fit the given points once they load
function FitTo({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [40, 40] })
    else if (points.length === 1) map.setView(points[0], 15)
  }, [map, JSON.stringify(points)]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

/**
 * stops: [{name, order, latitude, longitude}]
 * buses: [{bus, bus_number, latitude, longitude, is_live, updated_at, speed}]
 */
export default function BusMap({ stops = [], buses = [], fitStops = true, height = '60vh' }) {
  const stopPoints = stops.map((s) => [Number(s.latitude), Number(s.longitude)])

  return (
    <MapContainer center={NED_CENTER} zoom={13} style={{ height, width: '100%' }} className="rounded-2xl z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {stopPoints.length > 1 && <Polyline positions={stopPoints} pathOptions={{ color: '#7a1d42', weight: 5, opacity: 0.7 }} />}

      {stops.map((s, i) => (
        <CircleMarker
          key={s.id ?? i}
          center={stopPoints[i]}
          radius={7}
          pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#631635', fillOpacity: 1 }}
        >
          <Popup>
            <b>{s.order}. {s.name}</b>
          </Popup>
        </CircleMarker>
      ))}

      {buses.map((b) => (
        <Marker key={b.bus} position={[Number(b.latitude), Number(b.longitude)]} icon={busIcon(b.bus_number, b.is_live)}>
          <Popup>
            <b>{b.bus_number}</b> {b.route_code && `· Route ${b.route_code}`}
            <br />
            {b.is_live ? '🟢 Live' : '⚪ Offline'} · updated {new Date(b.updated_at).toLocaleTimeString()}
            {b.speed != null && <><br />Speed: {Math.round(b.speed)} km/h</>}
          </Popup>
        </Marker>
      ))}

      {fitStops && <FitTo points={stopPoints} />}
    </MapContainer>
  )
}
