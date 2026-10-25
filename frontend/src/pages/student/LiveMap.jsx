import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../api'
import BusMap from '../../components/BusMap.jsx'

const REFRESH_SECONDS = 10

export default function LiveMap() {
  const [params, setParams] = useSearchParams()
  const routeId = params.get('route') || ''
  const [routes, setRoutes] = useState([])
  const [route, setRoute] = useState(null)
  const [buses, setBuses] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)

  // Route dropdown
  useEffect(() => {
    api.get('/routes/').then(({ data }) => setRoutes(data))
  }, [])

  // Stops for the chosen route
  useEffect(() => {
    if (!routeId) return setRoute(null)
    api.get(`/routes/${routeId}/`).then(({ data }) => setRoute(data))
  }, [routeId])

  // Bus positions, refreshed every 10 seconds
  useEffect(() => {
    let alive = true
    async function load() {
      const { data } = await api.get('/tracking/live/', { params: routeId ? { route: routeId } : {} })
      if (alive) {
        setBuses(data)
        setLastUpdate(new Date())
      }
    }
    load()
    const timer = setInterval(load, REFRESH_SECONDS * 1000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [routeId])

  const liveCount = buses.filter((b) => b.is_live).length

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Live bus map</h1>
          <p className="text-sm text-stone-500">
            {liveCount} bus{liveCount === 1 ? '' : 'es'} live · refreshes every {REFRESH_SECONDS}s
            {lastUpdate && ` · last ${lastUpdate.toLocaleTimeString()}`}
          </p>
        </div>
        <select
          className="input sm:w-64"
          value={routeId}
          onChange={(e) => setParams(e.target.value ? { route: e.target.value } : {})}
        >
          <option value="">All routes</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>{r.code} · {r.name}</option>
          ))}
        </select>
      </div>

      <div className="card p-2">
        <BusMap stops={route?.stops || []} buses={buses} />
      </div>

      {buses.length === 0 ? (
        <div className="card p-5 text-center text-stone-500">No bus has shared its location yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {buses.map((b) => (
            <div key={b.bus} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-stone-900">{b.bus_number}</div>
                <div className="text-sm text-stone-500">Route {b.route_code || '—'} · {new Date(b.updated_at).toLocaleTimeString()}</div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${b.is_live ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                {b.is_live ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
