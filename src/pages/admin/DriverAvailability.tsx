import React, { useState } from 'react'
import Reveal from '../../components/Reveal'
import Layout from '../../components/Layout'
import Timeline from '../../components/Timeline'
import ScheduleModal from '../../components/ScheduleModal'
import { useApp } from '../../context/AppContext'
import { localTodayISO } from '../../utils/dateHelpers'

export default function DriverAvailability() {
  const { drivers } = useApp()
  const [date, setDate] = useState(localTodayISO())
  const [openDriverId, setOpenDriverId] = useState<string | null>(null)

  const activeDriver = drivers.find((d) => d.id === openDriverId) ?? null

  return (
    <Layout title="Driver availability" eyebrow="Admin — Workforce">
      <Reveal>
      <div className="card mb-4 !p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black tracking-tight text-lg">Driver schedule timeline</h2>
          <p className="text-sm text-muted mt-0.5">Click a driver or drag a block to adjust duty hours and breaks.</p>
        </div>
        <label>
          <span className="label">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field !w-auto"
          />
        </label>
      </div>
      </Reveal>

      <Reveal delay={1}>
      <Timeline date={date} drivers={drivers} onOpenSchedule={setOpenDriverId} />
      </Reveal>

      <ScheduleModal
        open={!!activeDriver}
        onClose={() => setOpenDriverId(null)}
        driver={activeDriver}
        date={date}
      />
    </Layout>
  )
}
