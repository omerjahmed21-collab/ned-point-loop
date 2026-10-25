import { useEffect, useRef, useState } from 'react'
import api, { errorText } from '../../api'
import { useAuth } from '../../auth.jsx'
import PhotoPicker from '../../components/PhotoPicker.jsx'

const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

function rupees(n) {
  return `Rs ${Number(n).toLocaleString('en-PK')}`
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="text-xs font-semibold text-brand-600 hover:text-brand-700"
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  )
}

/* ---------- The fee receipt itself ---------- */
function Receipt({ r }) {
  const rows = [
    ['Name', r.student_name],
    ['Roll no.', r.roll_number || '—'],
    ['Department', r.department || '—'],
    ['Route', r.route_code ? `${r.route_code} · ${r.route_name}` : '—'],
    ['Semester', r.semester],
  ]
  return (
    <article className="receipt card overflow-hidden max-w-2xl mx-auto">
      <header className="bg-brand-900 text-white px-5 py-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-b-4 border-accent-400">
        <img src="/ned-logo.png" alt="" className="w-12 h-12 object-contain bg-white rounded-full p-0.5" />
        <div className="flex-1 min-w-[10rem]">
          <div className="text-[11px] uppercase tracking-[0.14em] text-white/60">NED University</div>
          <div className="font-extrabold text-lg leading-tight">Point Bus Fee Receipt</div>
        </div>
        <div className="sm:text-right w-full sm:w-auto">
          <div className="text-[11px] uppercase tracking-wider text-white/60">Receipt no.</div>
          <div className="font-mono font-bold text-accent-400">{r.receipt_no}</div>
        </div>
      </header>

      <div className="p-5 grid sm:grid-cols-[auto_1fr] gap-5 items-start relative">
        <div className="w-32 h-40 mx-auto sm:mx-0 rounded-lg overflow-hidden border-2 border-cream-200 bg-cream-50">
          {r.photo
            ? <img src={r.photo} alt={`Photo of ${r.student_name}`} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-xs text-stone-400 text-center p-2">No photo</div>}
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm min-w-0">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-stone-500">{k}</dt>
              <dd className="font-semibold text-stone-900 break-words">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="paid-stamp absolute right-5 top-5 hidden sm:block rotate-[-8deg] border-[3px] border-green-700 text-green-700 rounded-lg px-3 py-1 text-center">
          <div className="font-black text-xl tracking-wider leading-none">PAID</div>
          <div className="text-[10px] font-bold uppercase tracking-wider">Verified</div>
        </div>
      </div>

      <div className="border-t border-dashed border-cream-200 mx-5" />

      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-stone-500">Amount</div>
          <div className="font-extrabold text-brand-700 text-lg tabular-nums">{rupees(r.amount)}</div>
        </div>
        <div>
          <div className="text-stone-500">Paid with</div>
          <div className="font-semibold">{r.method}</div>
        </div>
        <div className="min-w-0">
          <div className="text-stone-500">Transaction ID</div>
          <div className="font-mono font-semibold break-all">{r.transaction_id}</div>
        </div>
        <div>
          <div className="text-stone-500">Approved on</div>
          <div className="font-semibold">{formatDate(r.approved_at)}</div>
        </div>
      </div>

      <footer className="bg-green-50 text-green-900 text-sm px-5 py-3 flex items-center gap-2 border-t border-green-100">
        <span className="font-bold">✓ Fee verified by the transport office.</span>
        <span className="text-green-800">Show this receipt to the driver if asked.</span>
      </footer>
    </article>
  )
}

/* ---------- Upload or change the student's photo ---------- */
function PhotoCard({ currentUrl, onSaved }) {
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  async function save() {
    setError('')
    setSaved(false)
    setBusy(true)
    try {
      const body = new FormData()
      body.append('photo', photo)
      await api.post('/auth/photo/', body)
      setPhoto(null)
      setSaved(true)
      await onSaved()
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="no-print card p-5 space-y-3">
      <div>
        <h2 className="font-bold text-stone-900">Your photo</h2>
        <p className="text-sm text-stone-500">This photo is printed on your fee receipt and shown to the driver.</p>
      </div>
      <PhotoPicker file={photo} onChange={(f) => { setPhoto(f); setSaved(false) }} currentUrl={currentUrl} inputId="my-photo" />
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
      {saved && <p className="text-sm text-green-700">Photo saved. Your receipt now shows the new photo.</p>}
      {photo && (
        <div className="flex gap-2">
          <button type="button" className="btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save photo'}</button>
          <button type="button" className="btn-outline" onClick={() => setPhoto(null)} disabled={busy}>Cancel</button>
        </div>
      )}
    </section>
  )
}

/* ---------- Status of the latest submission ---------- */
function StatusBanner({ latest }) {
  if (latest?.status === 'pending') {
    return (
      <div className="rounded-2xl p-5 bg-amber-50 border border-amber-200">
        <div className="font-bold text-amber-900 text-lg">⏳ Payment under review</div>
        <div className="text-sm text-amber-800">
          The transport office is checking your payment. Your fee receipt appears here as soon as they approve it.
        </div>
      </div>
    )
  }
  if (latest?.status === 'rejected') {
    return (
      <div className="rounded-2xl p-5 bg-red-50 border border-red-200">
        <div className="font-bold text-red-900 text-lg">✗ Payment not approved</div>
        <div className="text-sm text-red-800">
          {latest.admin_note || 'The transport office could not verify your payment.'} Please check the details and submit again.
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-2xl p-5 bg-brand-50 border border-brand-100">
      <div className="font-bold text-brand-900 text-lg">No fee receipt yet</div>
      <div className="text-sm text-brand-800">
        Pay your point fee and submit the details below. Once the transport office approves it, your fee receipt with your photo appears here.
      </div>
    </div>
  )
}

export default function FeeReceipt() {
  const { user, reload } = useAuth()
  const [info, setInfo] = useState(null)
  const [form, setForm] = useState({ route: '', method: '', transaction_id: '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const fileInput = useRef(null)

  async function load() {
    const { data } = await api.get('/payments/')
    setInfo(data)
    return data
  }

  useEffect(() => {
    load()
  }, [])

  const latest = info?.payments?.[0]
  const pending = latest?.status === 'pending'

  // While a payment is pending, check every 15 seconds whether it was approved
  useEffect(() => {
    if (!pending) return
    const timer = setInterval(async () => {
      const data = await load()
      if (data.payments[0]?.status !== 'pending') reload()
    }, 15000)
    return () => clearInterval(timer)
  }, [pending]) // eslint-disable-line react-hooks/exhaustive-deps

  function pickFile(f) {
    setFile(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(f && f.type.startsWith('image/') ? URL.createObjectURL(f) : null)
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!info.has_photo) return setError('Add your photo in the "Your photo" section first. It is printed on your fee receipt.')
    if (!file) return setError('Attach a photo or PDF of your bank or wallet receipt.')
    setBusy(true)
    try {
      const body = new FormData()
      Object.entries(form).forEach(([k, v]) => body.append(k, v))
      body.append('receipt', file)
      await api.post('/payments/submit/', body)
      setForm({ route: '', method: '', transaction_id: '' })
      pickFile(null)
      if (fileInput.current) fileInput.current.value = ''
      await load()
      await reload()
    } catch (err) {
      setError(errorText(err))
      await load()
    } finally {
      setBusy(false)
    }
  }

  if (!info) return <p className="text-stone-500">Loading…</p>

  const receipt = info.receipt
  const showForm = !receipt && !pending

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="no-print flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Fee receipt</h1>
          <p className="text-sm text-stone-500">Point bus fee · {info.semester}</p>
        </div>
        {receipt
          ? <button type="button" onClick={() => window.print()} className="btn-outline">Print / save as PDF</button>
          : (
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-stone-500">Amount</div>
              <div className="text-2xl font-extrabold text-brand-700">{rupees(info.fee)}</div>
            </div>
          )}
      </div>

      {receipt ? <Receipt r={receipt} /> : <div className="no-print"><StatusBanner latest={latest} /></div>}

      <PhotoCard currentUrl={user.photo} onSaved={async () => { await load(); await reload() }} />

      {showForm && (
        <div className="no-print space-y-5">
          <section className="card p-5">
            <h2 className="font-bold text-stone-900">
              <span className="inline-flex w-6 h-6 rounded-full bg-brand-600 text-white text-xs items-center justify-center mr-2">1</span>
              Send {rupees(info.fee)} to one of these accounts
            </h2>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              {info.accounts.map((a) => (
                <div key={a.method} className="rounded-xl border border-cream-200 bg-cream-50 p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-brand-600">{a.label}</div>
                  <div className="text-sm text-stone-600 mt-1">{a.title}</div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="font-mono text-sm font-semibold text-stone-900 break-all">{a.number}</span>
                    <CopyButton text={a.number} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-bold text-stone-900">
              <span className="inline-flex w-6 h-6 rounded-full bg-brand-600 text-white text-xs items-center justify-center mr-2">2</span>
              Submit your payment details
            </h2>
            <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="label" htmlFor="fee-route">Your route</label>
                <select id="fee-route" className="input" required value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })}>
                  <option value="">Choose a route</option>
                  {info.routes.map((r) => <option key={r.id} value={r.id}>{r.code} · {r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="fee-method">Paid with</label>
                <select id="fee-method" className="input" required value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  <option value="">Choose a method</option>
                  {info.accounts.map((a) => <option key={a.method} value={a.method}>{a.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="fee-tid">Transaction ID</label>
                <input id="fee-tid" className="input font-mono" required placeholder="From your SMS or bank receipt"
                       value={form.transaction_id} onChange={(e) => setForm({ ...form, transaction_id: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="fee-file">Bank / wallet receipt (photo or PDF, max 5 MB)</label>
                <label htmlFor="fee-file" className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-cream-200 bg-cream-50 p-5 text-center cursor-pointer hover:border-brand-200">
                  {preview
                    ? <img src={preview} alt="Receipt preview" className="max-h-48 rounded-lg" />
                    : <span className="text-3xl">🧾</span>}
                  <span className="text-sm text-stone-600">
                    {file ? file.name : 'Tap to choose a screenshot or photo of your payment receipt'}
                  </span>
                </label>
                <input id="fee-file" ref={fileInput} type="file" accept="image/*,application/pdf" className="hidden"
                       onChange={(e) => pickFile(e.target.files[0] || null)} />
              </div>
              {error && <p className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 whitespace-pre-line">{error}</p>}
              <button className="btn-primary sm:col-span-2 py-3" disabled={busy}>
                {busy ? 'Submitting…' : 'Submit for approval'}
              </button>
            </form>
          </section>
        </div>
      )}

      {info.payments.length > 0 && (
        <section className="no-print card p-5">
          <h2 className="font-bold text-stone-900 mb-3">Your submissions</h2>
          <ul className="divide-y divide-cream-200">
            {info.payments.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="font-semibold text-stone-900 break-words">
                    {rupees(p.amount)} · {p.method_display} · <span className="font-mono">{p.transaction_id}</span>
                  </div>
                  <div className="text-stone-500">
                    {new Date(p.submitted_at).toLocaleString()} · Route {p.route_code || '—'}
                    {p.admin_note && <> · <span className="text-stone-700">{p.admin_note}</span></>}
                  </div>
                </div>
                <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[p.status]}`}>
                  {p.status_display}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
