import React, { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { DEMO_USERS } from '../data/mockData'

export default function Topbar({ title, eyebrow }: { title: string; eyebrow?: string }) {
  const { role, currentUser, setCurrentUser, setRole } = useRole()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const students = DEMO_USERS.filter((user) => user.role === 'USER')

  useEffect(() => {
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-xl border-b border-ink/15">
      <div className="flex items-center gap-4 min-h-[76px] py-3 px-4 md:px-8 max-w-[1400px] mx-auto">
        <div className="min-w-0">
          {eyebrow && <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-bus">{eyebrow}</p>}
          <h1 className="font-display font-black text-[22px] leading-none tracking-tight truncate mt-1">{title}</h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block relative">
            <div className="flex items-center gap-2.5 rounded-[4px] border border-ink/15 bg-white pl-1 pr-2 py-1">
              <span className="h-7 w-7 bg-espresso text-cream flex items-center justify-center font-mono text-[10px] font-bold rounded-[3px]">
                {role === 'ADMIN' ? 'AD' : currentUser.name.split(' ').map((n) => n[0]).join('')}
              </span>
              {role === 'ADMIN' ? (
                <span className="text-xs font-bold">Admin</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 text-xs font-bold hover:text-bus transition-colors"
                >
                  {currentUser.name.split(' ')[0]}
                  <ChevronDown className={`h-3.5 w-3.5 text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-[4px] border border-ink/15 bg-white p-1.5 shadow-pop z-50" role="menu">
                <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Switch user</p>
                {students.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setCurrentUser(student)
                      setRole('USER')
                      setUserMenuOpen(false)
                      navigate('/user/dashboard')
                    }}
                    className={`w-full text-left px-2.5 py-2 text-xs font-bold rounded-[3px] transition-colors ${currentUser.id === student.id ? 'bg-ink text-cream' : 'hover:bg-ink/[0.06]'}`}
                  >
                    {student.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setRole(null)}
            aria-label="Logout"
            title="Logout"
            className="border border-ink/15 bg-white px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ink hover:bg-bus hover:border-bus hover:text-cream transition-colors rounded-[4px]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
