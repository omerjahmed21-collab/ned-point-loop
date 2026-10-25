import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api'

export default function RoutesList() {
  const [routes, setRoutes] = useState(null)

  useEffect(() => {
    api.get('/routes/').then(({ data }) => setRoutes(data))
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Bus routes</h1>
        <p className="text-sm text-stone-500">Tap a route to see its stops and timings.</p>
      </div>

      {routes === null && <p className="text-stone-500">Loading…</p>}
      {routes?.length === 0 && <div className="card p-5 text-stone-500">No routes added yet.</div>}

      <div className="grid sm:grid-cols-2 gap-3">
        {routes?.map((r) => (
          <Link key={r.id} to={`/routes/${r.id}`} className="card p-4 flex items-center gap-4 hover:border-brand-500 transition">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
              {r.code}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-stone-900">{r.name}</div>
              <div className="text-sm text-stone-500">{r.stop_count} stops</div>
            </div>
            <span className="text-stone-400">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
