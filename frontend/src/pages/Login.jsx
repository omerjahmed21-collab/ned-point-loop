import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth, homeFor } from '../auth.jsx'
import { errorText } from '../api'
import AuthShell from '../components/AuthShell.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={homeFor(user)} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const me = await login(username.trim(), password)
      navigate(homeFor(me))
    } catch (err) {
      setError(err.response?.status === 401 ? 'Wrong roll number or password.' : errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Welcome to NED Point Loop.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Roll number</label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. CS-22045"
            autoComplete="username"
            autoCapitalize="characters"
            required
          />
          <p className="text-xs text-stone-500 mt-1">Drivers and transport office staff: use your username.</p>
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 autoComplete="current-password" required />
        </div>
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 whitespace-pre-line">{error}</p>}
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="text-sm text-center text-stone-500 mt-6">
        New student? <Link to="/signup" className="text-brand-600 font-semibold hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  )
}
