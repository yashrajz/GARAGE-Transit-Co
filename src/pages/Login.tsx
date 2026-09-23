import React from 'react'
import { GraduationCap, ShieldCheck, ArrowRight, Star, Wrench } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { Role } from '../types'
import { DEMO_USERS } from '../data/mockData'
import LazyImage from '../components/LazyImage'

const BUS_SIDE = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1400&q=70'
const BUS_FRONT = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=500&q=60'
const BUS_DETAIL = 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=500&q=60'

export default function Login() {
  const { setRole, setCurrentUser } = useRole()
  const navigate = useNavigate()
  const students = DEMO_USERS.filter((candidate) => candidate.role === 'USER')
  const adminUser = DEMO_USERS.find((candidate) => candidate.role === 'ADMIN')

  function pick(role: Role, userId = students[0]?.id ?? DEMO_USERS[0].id) {
    if (role === 'ADMIN' && adminUser) {
      setCurrentUser(adminUser)
      setRole('ADMIN')
      navigate('/admin/dashboard')
      return
    }
    const user = DEMO_USERS.find((candidate) => candidate.id === userId && candidate.role === 'USER') ?? students[0] ?? DEMO_USERS[0]
    setCurrentUser(user)
    setRole('USER')
    navigate('/user/dashboard')
  }

  function scrollToLogin() {
    document.getElementById('login-actions')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <main className="overflow-x-hidden w-full min-h-screen bg-base md:p-4 lg:p-7 text-ink">
      <div className="frame-shell max-w-[1280px] mx-auto overflow-hidden">
        <div className="bg-paper relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 grid-blueprint opacity-70" aria-hidden="true" />
          <nav className="relative flex items-center justify-between gap-5 px-5 md:px-10 pt-6" aria-label="Main navigation">
            <a href="#home" className="flex items-center gap-3" aria-label="Garage Transit home">
              <span className="bg-espresso text-cream p-1.5 rounded-[4px]"><Wrench className="h-4 w-4" /></span>
              <span className="text-center leading-none">
                <span className="block font-display font-black tracking-tight text-lg leading-none">GARAGE<span className="text-bus">.</span></span>
                <span className="mt-1 block font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-muted">Transit Co.</span>
              </span>
            </a>
            <div className="hidden md:flex items-center gap-6 text-xs font-bold">
              <a href="#home" className="text-ink hover:text-bus transition-colors">Home</a>
              <Link to="/about" className="text-muted hover:text-bus transition-colors">About</Link>
              <button type="button" onClick={scrollToLogin} className="btn-bus px-4 py-2 text-xs rounded-[4px]">Book now</button>
            </div>
          </nav>
          <div className="relative mx-5 md:mx-10 mt-4 h-px bg-ink/15" />
          <section id="home" className="relative px-5 md:px-10 pt-8 pb-2 text-center reveal">
            <h1 className="hero-display w-full max-w-4xl mx-auto text-[clamp(2.6rem,7vw,5.2rem)]">Smart LPU Transit, Made Simple.</h1>
            <p className="mt-3 text-[13px] text-muted max-w-md mx-auto leading-relaxed">
              Seamlessly book shuttle rides, track your LPU commute in real-time, and coordinate fleet schedules all from one place.
            </p>
          </section>
          <section id="routes" className="relative px-2 md:px-6 mt-2 reveal-1">
            <div className="rounded-[6px] overflow-hidden border border-ink/20 shadow-pop bg-white">
              <LazyImage src={BUS_SIDE} alt="Orange vintage Setra S 80 shuttle" className="aspect-[16/8] w-full" />
            </div>
          </section>
          <section className="relative px-5 md:px-10 pt-8 pb-3 flex flex-col items-center gap-4 reveal-2">
            <div className="text-center">
              <div className="ticket-edge w-40 mx-auto mb-4 opacity-70" />
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => pick('USER')} className="btn-bus rounded-[4px] px-8 py-3 text-sm">Book Now</button>
                <button onClick={() => pick('ADMIN')} className="btn-ghost rounded-[4px] px-6 py-3 text-sm">Admin</button>
              </div>
              <div className="ticket-edge w-40 mx-auto mt-4 opacity-70" />
            </div>
          </section>
          <section id="login-actions" className="relative px-5 md:px-10 pt-5 pb-7 reveal-3">
            <div className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
              <button onClick={() => pick('USER')} className="group text-left bg-white border border-ink/15 rounded-[4px] p-4 flex items-center gap-4 hover:-translate-y-[2px] hover:shadow-pop transition-all">
                <span className="bg-espresso text-cream p-2.5 rounded-[4px]"><GraduationCap className="h-5 w-5" /></span>
                <span className="flex-1"><span className="block font-bold text-[15px]">Login as Student</span><span className="block text-xs text-muted mt-0.5">Book seats and track trips</span></span>
                <ArrowRight className="h-4 w-4 text-muted group-hover:text-bus group-hover:translate-x-1 transition-all" />
              </button>
              <button onClick={() => pick('ADMIN')} className="group text-left bg-espresso text-cream rounded-[4px] p-4 flex items-center gap-4 hover:-translate-y-[2px] hover:shadow-pop transition-all">
                <span className="bg-cream/10 border border-cream/20 p-2.5 rounded-[4px]"><ShieldCheck className="h-5 w-5 text-frame" /></span>
                <span className="flex-1"><span className="block font-bold text-[15px]">Login as Admin</span><span className="block text-xs text-cream/60 mt-0.5">Bookings and driver control</span></span>
                <ArrowRight className="h-4 w-4 text-cream/50 group-hover:text-frame group-hover:translate-x-1 transition-all" />
              </button>
            </div>
            <label className="block max-w-xs mx-auto mt-4 text-center">
              <span className="label">Demo student</span>
              <select defaultValue={students[0]?.id ?? DEMO_USERS[0].id} onChange={(event) => pick('USER', event.target.value)} className="field text-center">
                {students.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            </label>
            <p className="text-center text-[12px] font-semibold text-ink/70 mt-7"><span className="font-black text-ink">LPU transit, made visible.</span> Book rides and coordinate the fleet from one place.</p>
            <div className="mt-4 overflow-hidden" aria-hidden="true">
              <div className="flex items-center gap-10 w-max animate-marquee font-display font-black text-ink/30 text-lg whitespace-nowrap">
                {['OpenZeppelin', 'ORACLE', 'MORPHEUS', 'SAMSUNG', 'monday', 'segment', 'OpenZeppelin', 'ORACLE', 'MORPHEUS', 'SAMSUNG', 'monday', 'segment'].map((b, i) => (
                  <span key={`${b}-${i}`}>{b}</span>
                ))}
              </div>
            </div>
            <div className="mt-5 flex items-center justify-center gap-3">
              <div className="border border-ink/20 rounded-[4px] overflow-hidden bg-white w-28"><LazyImage src={BUS_FRONT} alt="Shuttle front" className="aspect-[4/3]" /></div>
              <div className="border border-ink/20 rounded-[4px] overflow-hidden bg-white w-28"><LazyImage src={BUS_DETAIL} alt="Shuttle detail" className="aspect-[4/3]" /></div>
              <p className="text-[11px] font-bold">14.5K+<br /><span className="font-medium text-muted flex items-center gap-1"><Star className="h-3 w-3 fill-bus text-bus" /> Good Review</span></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
