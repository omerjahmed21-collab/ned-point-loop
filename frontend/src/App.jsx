import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth, homeFor } from './auth.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import AdminInfo from './pages/AdminInfo.jsx'
import RoutesList from './pages/student/RoutesList.jsx'
import RouteDetail from './pages/student/RouteDetail.jsx'
import LiveMap from './pages/student/LiveMap.jsx'
import FeeReceipt from './pages/student/FeeReceipt.jsx'
import Trip from './pages/driver/Trip.jsx'
import CheckStudent from './pages/driver/CheckStudent.jsx'

// Only lets a user in if they are logged in with one of the allowed roles
function Protected({ roles, children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-10 text-center text-stone-500">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  const { user, loading } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Student */}
      <Route path="/map" element={<Protected roles={['student', 'admin']}><LiveMap /></Protected>} />
      <Route path="/routes" element={<Protected roles={['student', 'admin']}><RoutesList /></Protected>} />
      <Route path="/routes/:id" element={<Protected roles={['student', 'admin']}><RouteDetail /></Protected>} />
      <Route path="/fee" element={<Protected roles={['student']}><FeeReceipt /></Protected>} />
      <Route path="/payment" element={<Navigate to="/fee" replace />} />

      {/* Driver */}
      <Route path="/driver" element={<Protected roles={['driver']}><Trip /></Protected>} />
      <Route path="/driver/check" element={<Protected roles={['driver']}><CheckStudent /></Protected>} />

      {/* Admin */}
      <Route path="/admin-info" element={<Protected roles={['admin']}><AdminInfo /></Protected>} />

      <Route path="*" element={loading ? null : <Navigate to={homeFor(user)} replace />} />
    </Routes>
  )
}
