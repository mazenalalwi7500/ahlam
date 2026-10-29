import { useEffect, useRef, useState } from 'react'

/** Small synthesized ambient track built with the Web Audio API — no external files. */
export function useAmbientMusic() {
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const nodesRef = useRef<{ stop: () => void } | null>(null)
  const [playing, setPlaying] = useState(false)

  const start = () => {
    if (nodesRef.current) return
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new Ctx()
    ctxRef.current = ctx

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    masterRef.current = master

    // soft fade-in
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2.5)

    // reverb-ish via feedback delay
    const delay = ctx.createDelay(1.0)
    delay.delayTime.value = 0.35
    const feedback = ctx.createGain()
    feedback.gain.value = 0.32
    const wet = ctx.createGain()
    wet.gain.value = 0.35
    delay.connect(feedback)
    feedback.connect(delay)
    delay.connect(wet)
    wet.connect(master)

    const noteFreqs = [
      196.0, // G3
      246.94, // B3
      293.66, // D4
      392.0, // G4
    ]

    const oscs: OscillatorNode[] = []
    const gains: GainNode[] = []

    // sustained pad
    noteFreqs.forEach((f, i) => {
      const o1 = ctx.createOscillator()
      o1.type = 'sine'
      o1.frequency.value = f
      const o2 = ctx.createOscillator()
      o2.type = 'triangle'
      o2.frequency.value = f * 1.005 // gentle detune
      const g = ctx.createGain()
      g.gain.value = 0
      o1.connect(g)
      o2.connect(g)
      g.connect(master)
      g.connect(delay)
      // slow swell per voice
      const t = ctx.currentTime
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.08 / (i + 1), t + 3 + i)
      oscs.push(o1, o2)
      gains.push(g)
      o1.start()
      o2.start()
    })

    // gentle arpeggio "bells"
    let step = 0
    const bellTimer = window.setInterval(() => {
      if (!ctxRef.current) return
      const ctx2 = ctxRef.current
      const seq = [523.25, 659.25, 783.99, 659.25, 523.25, 587.33, 698.46, 587.33]
      const f = seq[step % seq.length]
      step++
      const o = ctx2.createOscillator()
      o.type = 'sine'
      o.frequency.value = f
      const g = ctx2.createGain()
      g.gain.value = 0
      o.connect(g)
      g.connect(master)
      g.connect(delay)
      const t = ctx2.currentTime
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.06, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)
      o.start(t)
      o.stop(t + 1.7)
    }, 1400)

    oscs.forEach((o) => (o as any).onended = null)

    nodesRef.current = {
      stop: () => {
        clearInterval(bellTimer)
        const t = ctx.currentTime
        master.gain.cancelScheduledValues(t)
        master.gain.setValueAtTime(master.gain.value, t)
        master.gain.linearRampToValueAtTime(0, t + 1.2)
        oscs.forEach((o) => {
          try { o.stop(t + 1.3) } catch {}
        })
        window.setTimeout(() => {
          try { ctx.close() } catch {}
          ctxRef.current = null
          masterRef.current = null
          nodesRef.current = null
        }, 1500)
      },
    }
    setPlaying(true)
  }

  const stop = () => {
    nodesRef.current?.stop()
    setPlaying(false)
  }

  const toggle = () => (playing ? stop() : start())

  useEffect(() => () => nodesRef.current?.stop(), [])

  return { playing, toggle, start }
}

/** A short "whoosh + chime" sting for the moment the envelope opens. */
export function playOpenSting() {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext
  if (!Ctx) return
  const ctx = new Ctx()
  const master = ctx.createGain()
  master.gain.value = 0.0001
  master.connect(ctx.destination)
  master.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.05)

  // whoosh (filtered noise)
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2)
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 700
  bp.Q.value = 0.8
  noise.connect(bp)
  bp.connect(master)
  noise.start()

  // shimmering chime
  const chimes = [659.25, 987.77, 1318.51]
  chimes.forEach((f, i) => {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    const g = ctx.createGain()
    g.gain.value = 0
    o.connect(g)
    g.connect(master)
    const t = ctx.currentTime + i * 0.12
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.12, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4)
    o.start(t)
    o.stop(t + 1.5)
  })

  master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8)
  window.setTimeout(() => { try { ctx.close() } catch {} }, 2200)
}
