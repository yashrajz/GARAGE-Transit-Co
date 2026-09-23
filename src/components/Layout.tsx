import React from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'

export default function Layout({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base text-ink md:p-3 lg:p-5">
      <div className="frame-shell min-h-[calc(100vh-24px)] lg:min-h-[calc(100vh-40px)] overflow-hidden">
        <div className="bg-paper min-h-[calc(100vh-44px)] lg:min-h-[calc(100vh-72px)] flex relative">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 grid-blueprint opacity-60" style={{ maskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black 30%, transparent 75%)' }} />
            <div className="orb h-[380px] w-[380px] -top-32 left-[10%] bg-bus/10" />
          </div>
          <Sidebar />
          <div className="flex-1 min-w-0 relative">
            <Topbar title={title} eyebrow={eyebrow} />
            <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 pb-28 md:pb-12">{children}</main>
          </div>
          <MobileNav />
        </div>
      </div>
    </div>
  )
}
