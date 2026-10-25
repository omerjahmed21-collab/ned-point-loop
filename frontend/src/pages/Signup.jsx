import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { errorText } from '../api'
import { useAuth } from '../auth.jsx'
import AuthShell from '../components/AuthShell.jsx'
import PhotoPicker from '../components/PhotoPicker.jsx'

const DEPARTMENTS = [
  'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Electronic Engineering',
  'Computer & Information Systems Engineering', 'Computer Science', 'Software Engineering',
  'Industrial & Manufacturing Engineering', 'Chemical Engineering', 'Petroleum Engineering',
  'Telecommunications Engineering', 'Biomedical Engineering', 'Materials Engineering',
  'Metallurgical Engineering', 'Textile Engineering', 'Automotive Engineering', 'Architecture & Planning',
]

const FIELDS = [
  { name: 'first_name', label: 'First name', half: true, autoComplete: 'given-name' },
  { name: 'last_name', label: 'Last name', half: true, optional: true, autoComplete: 'family-name' },
  { name: 'roll_number', label: 'Roll number', placeholder: 'e.g. CS-22045', hint: 'You will sign in with this.', half: true },
  { name: 'department', label: 'Department', list: 'departments', half: true },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Phone', optional: true, placeholder: '03xx xxxxxxx', autoComplete: 'tel' },
  { name: 'password', label: 'Password', type: 'password', placeholder: 'At least 8 characters', autoComplete: 'new-password' },
]

export default function Signup() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({})
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!photo) return setError('Add a clear photo of your face. It is printed on your fee receipt.')
    setBusy(true)
    try {
      const body = new FormData()
      Object.entries(form).forEach(([k, v]) => body.append(k, v))
      body.append('photo', photo)
      const { data } = await api.post('/auth/signup/', body)
      await login(data.username, form.password)
      navigate('/map')
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Register once to track your bus and submit your point fee.">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <PhotoPicker file={photo} onChange={setPhoto} inputId="signup-photo" />
        </div>
        {FIELDS.map((f) => (
          <div key={f.name} className={f.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
            <label className="label" htmlFor={`signup-${f.name}`}>
              {f.label} {f.optional && <span className="text-stone-400 font-normal">(optional)</span>}
            </label>
            <input
              id={`signup-${f.name}`}
              className="input"
              type={f.type || 'text'}
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
              list={f.list}
              required={!f.optional}
              value={form[f.name] || ''}
              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
            />
            {f.hint && <p className="text-xs text-stone-500 mt-1">{f.hint}</p>}
          </div>
        ))}
        <datalist id="departments">
          {DEPARTMENTS.map((d) => <option key={d} value={d} />)}
        </datalist>
        {error && <p className="col-span-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 whitespace-pre-line">{error}</p>}
        <button className="btn-primary col-span-2 mt-1 py-3" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="text-sm text-center text-stone-500 mt-6">
        Already registered? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  )
}
