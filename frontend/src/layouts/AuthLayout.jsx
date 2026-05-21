import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function AuthLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-paper)' }}>
      <Navbar />
      <Outlet />
    </div>
  )
}
