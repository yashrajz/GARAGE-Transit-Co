import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CalendarPlus, Ticket, History, Route as RouteIcon,
  ChevronsLeft, ChevronsRight, Wrench, ArrowUpRight,
} from 'lucide-react'
import { useRole } from '../context/RoleContext'
import { useShuttleSelection } from '../context/ShuttleSelectionContext'

const userLinks = [
  { to: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/user/book', label: 'Book Shuttle', icon: CalendarPlus },
  { to: '/user/bookings', label: 'My Bookings', icon: Ticket },
  { to: '/user/history', label: 'Trip History', icon: History },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/bookings', label: 'All Bookings', icon: Ticket },
  { to: '/admin/drivers', label: 'Driver Availability', icon: RouteIcon },
  { to: '/admin/routes', label: 'Route Management', icon: RouteIcon },
]

export default function Sidebar() {
  const { role } = useRole()
  const [collapsed, setCollapsed] = useState(false)
  const links = role === 'ADMIN' ? adminLinks : userLinks
  const { selectedShuttle } = useShuttleSelection()

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 sticky top-0 h-screen bg-paper border-r border-ink/15 transition-all duration-300 z-20 ${
        collapsed ? 'w-[76px]' : 'w-[252px]'
      }`}
    >
      <div className="flex items-center justify-center gap-3 px-4 min-h-[76px] py-3 border-b border-ink/15">
        <div className="bg-espresso text-cream p-2 shrink-0 rounded-[4px] relative">
          <Wrench className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-bus border-2 border-paper" />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-none">
            <p className="font-display font-black tracking-tight text-[19px] leading-none">GARAGE</p>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-muted mt-1.5">Transit Co.</p>
          </div>
        )}
      </div>

      {!collapsed && (
        <p className="px-5 pt-5 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
          {role === 'ADMIN' ? 'Control Tower' : 'Travel Desk'}
        </p>
      )}

      <nav className="flex-1 px-3 py-1 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold tracking-tight transition-all duration-200 group rounded-[4px] ${
                isActive ? 'bg-ink text-cream shadow-pop' : 'text-ink/60 hover:text-ink hover:bg-ink/[0.06]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-[17px] w-[17px] shrink-0 ${isActive ? 'text-frame' : ''}`} />
                {!collapsed && <span className="relative z-10 truncate flex-1 text-left">{label}</span>}
                {isActive && !collapsed && <ArrowUpRight className="h-3.5 w-3.5 text-frame" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-3 bg-espresso text-cream p-4 overflow-hidden relative rounded-[4px]">
          <div className="absolute inset-0 grid-blueprint opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(251,248,240,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(251,248,240,0.12) 1px, transparent 1px)' }} />
          <p className="relative font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-frame">Selected departure</p>
          <p className="relative font-display font-black text-xl mt-1 tracking-tight">{selectedShuttle?.routeName ?? 'No upcoming shuttle'}</p>
          <p className="relative text-xs text-cream/60 mt-1">{selectedShuttle ? `${selectedShuttle.occupancyPercentage}% full · ${selectedShuttle.availableSeats} seats left` : 'Check back later.'}</p>
          <div className="relative mt-3 h-1.5 bg-cream/15 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-frame to-bus rounded-full transition-all duration-300" style={{ width: `${selectedShuttle?.occupancyPercentage ?? 0}%` }} />
          </div>
        </div>
      )}

      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="m-3 flex items-center justify-center border border-ink/15 bg-white px-3 py-2.5 text-muted hover:text-ink hover:border-ink transition-colors rounded-[4px]"
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
      </button>
    </aside>
  )
}
