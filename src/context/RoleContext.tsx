import React, { createContext, useContext, useState } from 'react'
import { AppUser, Role } from '../types'
import { DEMO_USERS } from '../data/mockData'

interface RoleContextValue {
  role: Role | null
  currentUser: AppUser
  setRole: (r: Role | null) => void
  setCurrentUser: (user: AppUser) => void
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)
  const [currentUser, setCurrentUser] = useState<AppUser>(DEMO_USERS[0])
  return <RoleContext.Provider value={{ role, currentUser, setRole, setCurrentUser }}>{children}</RoleContext.Provider>
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
