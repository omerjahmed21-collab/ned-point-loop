import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errorText } from '../../api'
import { useAuth } from '../../auth.jsx'
import BusMap from '../../components/BusMap.jsx'

const SEND_EVERY_MS = 10000
const SIMULATE_EVERY_MS = 3000

// Points between each pair of stops, so the simulated bus moves smoothly
function pathAlong(stops, stepsPerLeg = 6) {
  const pts = stops.map((s) => [Number(s.latitude), Number(s.longitude)])
  const out = []
  for (let i = 0; i < pts.length - 1; i++) {
    for (let k = 0; k < stepsPerLeg; k++) {
      const t = k / stepsPerLeg
      out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t])
    }
  }
  if (pts.length) out.push(pts[pts.length - 1])
  return out
}

export default function Trip() {
  const { user } = useAuth()
  const bus = user.bus
  const [mode, setMode] = useState(null) // null | 'gps' | 'demo'
  const [position, setPosition] = useState(null)
  const [lastSent, setLastSent] = useState(null)
  const [sentCount, setSentCount] = useState(0)
  const [error, setError] = useState('')
  const [stops, setStops] = useState([])

  const latest = useRef(null)
  const watchId = useRef(null)
  const timer = useRef(null)

  // Load the stops of this driver's route (for the map and demo mode)
  useEffect(() => {
    if (!bus?.route_code) return
    api.get('/routes/').then(async ({ data }) => {
      const r = data.find((x) => x.code === bus.route_code)
      if (r) {
        const { data: detail } = await api.get(`/routes/${r.id}/`)
        setStops(detail.stops)
      }
    })
  }, [bus?.route_code])

  async function send(lat, lng, speed) {
    try {
      await api.post('/tracking/update/', { latitude: lat, longitude: lng, speed })
      setLastSent(new Date())
      setSentCount((c) => c + 1)
      setError('')
    } catch (err) {
      setError(errorText(err))
    }
  }

  function startGps() {
    if (!navigator.geolocation) return setError('This browser has no GPS support.')
    setError('')
    setMode('gps')
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        const speedKmh = p.coords.speed != null ? p.coords.speed * 3.6 : null
        latest.current = { lat: p.coords.latitude, lng: p.coords.longitude, speed: speedKmh }
        setPosition([p.coords.latitude, p.coords.longitude])
      },
      (e) => setError(e.code === 1
        ? 'Location permission denied. Allow location for this site and try again.'
        : `GPS error: ${e.message}`),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    )
    timer.current = setInterval(() => {
      const l = latest.current
      if (l) send(l.lat, l.lng, l.speed)
    }, SEND_EVERY_MS)
    // Send the first fix as soon as it arrives
    navigator.geolocation.getCurrentPosition((p) => send(p.coords.latitude, p.coords.longitude, null), () => {})
  }

  function startDemo() {
    const path = pathAlong(stops)
    if (path.length < 2) return setError('This route needs at least 2 stops for demo mode.')
    setError('')
    setMode('demo')
    let i = 0
    const step = () => {
      const [lat, lng] = path[i]
      setPosition([lat, lng])
      send(lat, lng, 32)
      i = (i + 1) % path.length
    }
    step()
    timer.current = setInterval(step, SIMULATE_EVERY_MS)
  }

  function stop() {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current)
    clearInterval(timer.current)
    watchId.current = null
    timer.current = null
    setMode(null)
  }

  useEffect(() => stop, []) // stop sharing when leaving the page

  if (!bus) {
    return (
      <div className="card p-6 text-center max-w-md mx-auto">
        <div className="text-4xl mb-2">🚌</div>
        <h1 className="text-lg font-bold">No bus assigned</h1>
        <p className="text-sm text-stone-500">Ask the transport admin to assign you a bus.</p>
      </div>
    )
  }

  const busMarker = position
    ? [{ bus: bus.id, bus_number: bus.bus_number, latitude: position[0], longitude: position[1], is_live: true, updated_at: lastSent || new Date(), route_code: bus.route_code }]
    : []

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-stone-500">Your bus</div>
            <h1 className="text-2xl font-bold text-stone-900">{bus.bus_number}</h1>
            <div className="text-sm text-stone-600">Route {bus.route_code} · {bus.route_name}</div>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${mode ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
            {mode ? (mode === 'demo' ? '● DEMO TRIP' : '● SHARING LOCATION') : 'NOT SHARING'}
          </span>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          {!mode ? (
            <>
              <button onClick={startGps} className="btn-primary flex-1 py-3 text-base">▶ Start trip (GPS)</button>
              <button onClick={startDemo} className="btn-outline flex-1 py-3" disabled={stops.length < 2}>
                Simulate trip (demo)
              </button>
            </>
          ) : (
            <button onClick={stop} className="btn-danger flex-1 py-3 text-base">■ End trip</button>
          )}
          <Link to="/driver/check" className="btn-outline flex-1 py-3">🪪 Check student</Link>
        </div>

        {mode && (
          <p className="text-sm text-stone-500 mt-3">
            Sent {sentCount} update{sentCount === 1 ? '' : 's'}
            {lastSent && ` · last at ${lastSent.toLocaleTimeString()}`}. Keep this page open during the trip.
          </p>
        )}
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      <div className="card p-2">
        <BusMap stops={stops} buses={busMarker} height="45vh" />
      </div>
    </div>
  )
}
