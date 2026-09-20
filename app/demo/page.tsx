'use client'

import { useEffect, useState } from 'react'

const scenes = [
  { kicker: 'FarmPulse', title: 'Your farm\'s vital signs, at your fingertips.', body: 'A 30-second look at smarter decisions powered by NASA data.', tone: 'hero' },
  { kicker: '01 · See the big picture', title: 'One calm dashboard for every field.', body: 'Track crop health, weather, irrigation, and growth in one place.', tone: 'dashboard' },
  { kicker: '02 · Monitor crop health', title: 'Spot stress before it becomes a setback.', body: 'NDVI insights turn satellite imagery into a clear signal for action.', tone: 'crop' },
  { kicker: '03 · Plan with confidence', title: 'Weather intelligence that keeps you ahead.', body: 'Use current conditions and forecasts to make the next move with confidence.', tone: 'weather' },
  { kicker: 'FarmPulse', title: 'Grow smarter. Waste less.', body: 'Farm intelligence designed for the decisions that matter.', tone: 'end' },
]

export default function DemoPage() {
  const [scene, setScene] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setScene((current) => (current + 1) % scenes.length), 6000)
    return () => window.clearInterval(timer)
  }, [])

  const current = scenes[scene]

  return (
    <main className="demo-shell" aria-label="FarmPulse product demo">
      <div className={`demo-stage ${current.tone}`}>
        <div className="demo-noise" />
        <header className="demo-header">
          <div className="demo-brand"><span className="demo-mark">⌁</span><span>Farm<span>Pulse</span></span></div>
          <span className="demo-timestamp">00:{String(scene * 6).padStart(2, '0')} / 00:30</span>
        </header>
        <section className="demo-content">
          <div className="demo-copy">
            <p className="demo-kicker">{current.kicker}</p>
            <h1>{current.title}</h1>
            <p className="demo-body">{current.body}</p>
          </div>
          <div className="demo-visual" aria-hidden="true">
            <div className="visual-orbit" />
            <div className="visual-card card-a"><span>Crop health</span><strong>{current.tone === 'crop' ? '86%' : 'Healthy'}</strong><small>NDVI signal</small></div>
            <div className="visual-card card-b"><span>{current.tone === 'weather' ? 'Forecast' : 'Field conditions'}</span><strong>{current.tone === 'weather' ? '72°F' : 'Optimal'}</strong><small>{current.tone === 'weather' ? 'Clear skies ahead' : 'Updated just now'}</small></div>
            <div className="visual-chart"><i /><i /><i /><i /><i /><i /><i /></div>
          </div>
        </section>
        <footer className="demo-footer">
          <div className="demo-progress"><span style={{ width: `${((scene + 1) / scenes.length) * 100}%` }} /></div>
          <span>Powered by NASA POWER API</span>
          <span>Smart agriculture, made clear.</span>
        </footer>
      </div>
      <p className="demo-hint">This 30-second demo advances automatically.</p>
    </main>
  )
}

// The demo is intentionally self-contained so it can be screen-recorded or embedded in a presentation.
