import React from 'react'
import { ArrowLeft, ArrowRight, BusFront, Clock3, MapPinned, ShieldCheck, Users, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import LazyImage from '../components/LazyImage'

const CAMPUS_IMAGE = '/lpu-building.jpg'

const principles = [
  { icon: MapPinned, title: 'Every stop has a place', description: 'Routes are organized around the real places LPU students, faculty, and teams move through every day.' },
  { icon: Clock3, title: 'Time stays visible', description: 'Departure windows, availability, and booking status stay clear from the first search to boarding.' },
  { icon: ShieldCheck, title: 'Operations stay accountable', description: 'Admin approvals, driver schedules, and live booking updates keep the whole network coordinated.' },
]

export default function About() {
  return (
    <main className="overflow-x-hidden w-full min-h-screen bg-base md:p-4 lg:p-7 text-ink">
      <div className="frame-shell max-w-[1280px] mx-auto overflow-hidden">
        <div className="bg-paper relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 grid-blueprint opacity-70" aria-hidden="true" />
          <nav className="relative flex items-center justify-between gap-5 px-5 md:px-10 pt-6" aria-label="About navigation">
            <Link to="/" className="flex items-center gap-3" aria-label="Back to Garage Transit home">
              <span className="bg-espresso text-cream p-1.5 rounded-[4px]"><Wrench className="h-4 w-4" /></span>
              <span className="text-center leading-none">
                <span className="block font-display font-black tracking-tight text-lg leading-none">GARAGE<span className="text-bus">.</span></span>
                <span className="mt-1 block font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-muted">Transit Co.</span>
              </span>
            </Link>
            <Link to="/" className="btn-ghost px-4 py-2 text-xs rounded-[4px] inline-flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
          </nav>
          <div className="relative mx-5 md:mx-10 mt-4 h-px bg-ink/15" />

          <section className="relative grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-end px-5 md:px-10 pt-12 pb-10">
            <div className="reveal">
              <p className="eyebrow">About Garage Transit</p>
              <h1 className="hero-display max-w-3xl text-[clamp(2.8rem,7vw,6rem)] mt-4">Moving LPU forward, one ride at a time.</h1>
              <p className="max-w-xl text-base text-muted leading-relaxed mt-5">Garage Transit is the shared shuttle desk for Lovely Professional University. It makes campus movement easier to understand, easier to book, and easier to run.</p>
              <Link to="/" className="btn-bus mt-7 px-5 py-3 text-sm rounded-[4px] inline-flex items-center gap-2">Book an LPU ride <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="reveal-1 rounded-[5px] overflow-hidden border border-ink/20 shadow-pop bg-white">
              <LazyImage src={CAMPUS_IMAGE} alt="LPU campus building" className="aspect-[5/4] w-full" />
              <div className="p-4 border-t border-ink/15 flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Lovely Professional University</span>
                <BusFront className="h-5 w-5 text-bus shrink-0" />
              </div>
            </div>
          </section>

          <section className="relative px-5 md:px-10 py-10 border-t border-ink/10">
            <div className="grid sm:grid-cols-3 gap-4">
              {principles.map(({ icon: Icon, title, description }, index) => (
                <article key={title} className={`paper p-5 reveal-${Math.min(index + 1, 3)}`}>
                  <Icon className="h-5 w-5 text-bus" />
                  <h2 className="font-display font-black text-lg mt-5">{title}</h2>
                  <p className="text-sm text-muted leading-relaxed mt-2">{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="relative px-5 md:px-10 pt-4 pb-12">
            <div className="bg-espresso text-cream rounded-[4px] p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <p className="eyebrow text-frame">Built for the LPU community</p>
                <h2 className="font-display font-black text-2xl md:text-3xl mt-3">Less waiting. More knowing.</h2>
                <p className="text-sm text-cream/65 max-w-xl mt-2 leading-relaxed">Students get a simpler booking experience. Admins get a clearer view of demand, approvals, drivers, and every active route.</p>
              </div>
              <div className="flex items-center gap-3 text-frame">
                <Users className="h-7 w-7" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">One connected network</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
