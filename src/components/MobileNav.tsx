import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarPlus, Ticket, History, Route as RouteIcon } from 'lucide-react'
import { useRole } from '../context/RoleContext'

const userLinks = [
  { to: '/user/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/user/book', label: 'Book', icon: CalendarPlus },
  { to: '/user/bookings', label: 'Bookings', icon: Ticket },
  { to: '/user/history', label: 'History', icon: History },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/admin/bookings', label: 'Bookings', icon: Ticket },
  { to: '/admin/drivers', label: 'Drivers', icon: RouteIcon },
  { to: '/admin/routes', label: 'Routes', icon: RouteIcon },
]

export default function MobileNav() {
  const { role } = useRole()
  const links = role === 'ADMIN' ? adminLinks : userLinks

  return (
    <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-espresso text-cream shadow-pop rounded-[4px] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex justify-around px-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 py-2.5 px-4 text-[11px] font-bold rounded-[4px] transition-all ${
                isActive ? 'text-frame' : 'text-cream/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute top-1 h-0.5 w-8 bg-bus rounded-full" />}
                <Icon className="h-5 w-5 relative" />
                <span className="relative">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
