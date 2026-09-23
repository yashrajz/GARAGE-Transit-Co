import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useRole } from './context/RoleContext'
import Login from './pages/Login'
import About from './pages/About'
import { lazyWithPreload } from './utils/lazy'

const UserDashboard = lazyWithPreload(() => import('./pages/user/Dashboard'))
const BookShuttle = lazyWithPreload(() => import('./pages/user/BookShuttle'))
const MyBookings = lazyWithPreload(() => import('./pages/user/MyBookings'))
const TripHistory = lazyWithPreload(() => import('./pages/user/TripHistory'))
const AdminDashboard = lazyWithPreload(() => import('./pages/admin/AdminDashboard'))
const AllBookings = lazyWithPreload(() => import('./pages/admin/AllBookings'))
const DriverAvailability = lazyWithPreload(() => import('./pages/admin/DriverAvailability'))
const RouteManagement = lazyWithPreload(() => import('./pages/admin/RouteManagement'))

// Wait for the login screen to paint before warming the next route chunk.
const PRELOAD_DELAY_MS = 2500

// Warm the most likely next chunk after login paints.
if (typeof window !== 'undefined') {
  window.setTimeout(() => {
    UserDashboard.preload?.()
    AdminDashboard.preload?.()
  }, PRELOAD_DELAY_MS)
  const onIdle = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback
  if (onIdle) {
    onIdle(() => {
      BookShuttle.preload?.()
      MyBookings.preload?.()
    })
  }
}

function PageFallback() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="paper max-w-sm w-full p-8 text-center reveal">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-dashed border-bus/60 animate-spinSlow flex items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-bus" />
        </div>
        <p className="font-display font-black tracking-tight text-lg">Warming up the engine…</p>
        <p className="text-sm text-muted mt-1">Loading your garage.</p>
        <div className="mt-5 h-1.5 rounded-full bg-ink/10 overflow-hidden">
          <div className="h-full rounded-full bg-accent-gradient animate-marquee" style={{ width: '40%' }} />
        </div>
      </div>
    </div>
  )
}


export default function App() {
  const { role } = useRole()

  if (!role) {
    return (
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  if (role === 'ADMIN') {
    return (
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<AllBookings />} />
          <Route path="/admin/drivers" element={<DriverAvailability />} />
          <Route path="/admin/routes" element={<RouteManagement />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/book" element={<BookShuttle />} />
        <Route path="/user/bookings" element={<MyBookings />} />
        <Route path="/user/history" element={<TripHistory />} />
        <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
