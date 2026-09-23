import React from 'react'

interface AppErrorBoundaryState {
  hasError: boolean
}

export default class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-base text-ink flex items-center justify-center p-6">
          <section className="card max-w-md text-center">
            <p className="eyebrow">System notice</p>
            <h1 className="hero-display text-3xl mt-3">This page needs a restart.</h1>
            <p className="text-sm text-muted mt-3">The demo could not render this view. Reload the application to restore the seeded mock data.</p>
            <button onClick={() => window.location.reload()} className="btn-bus px-5 py-3 text-sm rounded-[4px] mt-6">Reload application</button>
          </section>
        </main>
      )
    }
    return this.props.children
  }
}