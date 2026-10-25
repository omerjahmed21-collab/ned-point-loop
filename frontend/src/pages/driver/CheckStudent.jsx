import { useState } from 'react'
import api, { errorText } from '../../api'

export default function CheckStudent() {
  const [roll, setRoll] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function check(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    setBusy(true)
    try {
      const { data } = await api.get('/passes/check/', { params: { roll: roll.trim() } })
      setResult(data)
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Check student</h1>
        <p className="text-sm text-stone-500">Type the roll number to see the student's photo and whether their fee is paid.</p>
      </div>

      <form onSubmit={check} className="flex gap-2">
        <label htmlFor="check-roll" className="sr-only">Roll number</label>
        <input id="check-roll" className="input font-mono uppercase" placeholder="e.g. CS-22045" required
               autoCapitalize="characters" value={roll} onChange={(e) => setRoll(e.target.value)} />
        <button className="btn-primary shrink-0" disabled={busy}>{busy ? 'Checking…' : 'Check'}</button>
      </form>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

      {result && (
        <div className="card overflow-hidden">
          <div className={`px-5 py-3 text-white font-black text-xl ${result.paid ? 'bg-green-600' : 'bg-red-600'}`}>
            {result.paid ? '✓ FEE PAID' : '✗ FEE NOT PAID'}
          </div>
          <div className="p-5 flex gap-4 items-start">
            <div className="w-28 h-36 shrink-0 rounded-lg overflow-hidden border-2 border-cream-200 bg-cream-50">
              {result.photo
                ? <img src={result.photo} alt={`Photo of ${result.name}`} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xs text-stone-400 text-center p-2">No photo</div>}
            </div>
            <dl className="text-sm space-y-1.5 min-w-0">
              <div><dt className="text-stone-500 inline">Name: </dt><dd className="inline font-semibold">{result.name}</dd></div>
              <div><dt className="text-stone-500 inline">Roll no.: </dt><dd className="inline font-semibold font-mono">{result.roll_number}</dd></div>
              <div><dt className="text-stone-500 inline">Department: </dt><dd className="inline font-semibold">{result.department || '—'}</dd></div>
              {result.paid && (
                <>
                  <div><dt className="text-stone-500 inline">Route: </dt><dd className="inline font-semibold">{result.route_code} · {result.route_name}</dd></div>
                  <div><dt className="text-stone-500 inline">Receipt: </dt><dd className="inline font-semibold font-mono">{result.receipt_no}</dd></div>
                </>
              )}
            </dl>
          </div>
          <p className="px-5 pb-4 text-xs text-stone-500">Make sure the person in front of you matches this photo.</p>
        </div>
      )}
    </div>
  )
}
