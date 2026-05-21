import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import MainLayout  from '../layouts/MainLayout'
import AuthLayout  from '../layouts/AuthLayout'

import Home               from '../pages/Home'
import Catalog            from '../pages/Catalog'
import CabinDetail        from '../pages/CabinDetail'
import CreateReservation  from '../pages/CreateReservation'
import UpdateReservation  from '../pages/UpdateReservation'
import Payment            from '../pages/Payment'
import ManageReservations from '../pages/ManageReservations'
import AdminCabins               from '../pages/AdminCabins'
import AdminCabinPhotos          from '../pages/AdminCabinPhotos'
import AdminCreateCabin          from '../pages/AdminCreateCabin'
import AdminCreateReservation    from '../pages/AdminCreateReservation'
import AdminAnalytics            from '../pages/AdminAnalytics'
import Login              from '../pages/Login'
import Register           from '../pages/Register'
import Profile            from '../pages/Profile'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="cabinas" element={<Catalog />} />
        <Route path="cabinas/:slug" element={<CabinDetail />} />
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="register" element={<GuestRoute><Register /></GuestRoute>} />
      </Route>

      {/* Private */}
      <Route element={<MainLayout />}>
        <Route path="reservas/nueva"         element={<PrivateRoute><CreateReservation /></PrivateRoute>} />
        <Route path="reservas/:id/editar"    element={<PrivateRoute><UpdateReservation /></PrivateRoute>} />
        <Route path="reservas/:id/pago"      element={<PrivateRoute><Payment /></PrivateRoute>} />
        <Route path="perfil"                 element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="admin/reservas"         element={<AdminRoute><ManageReservations /></AdminRoute>} />
        <Route path="admin/reservas/nueva"   element={<AdminRoute><AdminCreateReservation /></AdminRoute>} />
        <Route path="admin/cabanas"          element={<AdminRoute><AdminCabins /></AdminRoute>} />
        <Route path="admin/cabanas/nueva"    element={<AdminRoute><AdminCreateCabin /></AdminRoute>} />
        <Route path="admin/cabanas/:id"      element={<AdminRoute><AdminCabinPhotos /></AdminRoute>} />
        <Route path="admin/analiticas"       element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
