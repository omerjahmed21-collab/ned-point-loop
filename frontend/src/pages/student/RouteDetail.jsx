import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api'
import BusMap from '../../components/BusMap.jsx'

function formatTime(t) {
  const [h, m] = t.split(':').map(Number)
  return new Date(2000, 0, 1, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function RouteDetail() {
  const { id } = useParams()
  const [route, setRoute] = useState(null)

  useEffect(() => {
    api.get(`/routes/${id}/`).then(({ data }) => setRoute(data))
  }, [id])

  if (!route) return <p className="text-stone-500">Loading…</p>

  return (
    <div className="space-y-4">
      <Link to="/routes" className="text-sm text-brand-600 font-medium">‹ All routes</Link>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{route.code} · {route.name}</h1>
          <p className="text-sm text-stone-500">
            {route.buses.length ? `Buses: ${route.buses.map((b) => b.bus_number).join(', ')}` : 'No bus assigned yet'}
          </p>
        </div>
        <Link to={`/map?route=${route.id}`} className="btn-primary shrink-0">Track live</Link>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <div className="md:col-span-3 card p-2">
          <BusMap stops={route.stops} height="380px" />
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="card p-4">
            <h2 className="font-semibold text-stone-900 mb-3">Timings</h2>
            {route.schedules.length === 0 && <p className="text-sm text-stone-500">No timings added yet.</p>}
            <ul className="space-y-2">
              {route.schedules.map((s) => (
                <li key={s.id} className="flex justify-between text-sm">
                  <span className="text-stone-600">{s.trip_type_display}</span>
                  <span className="font-semibold">{formatTime(s.departure_time)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4">
            <h2 className="font-semibold text-stone-900 mb-3">Stops</h2>
            <ol className="relative border-l-2 border-brand-100 ml-2 space-y-3">
              {route.stops.map((s) => (
                <li key={s.id} className="pl-4 relative">
                  <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-brand-600 ring-2 ring-white" />
                  <span className="text-sm text-stone-800">{s.name}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
