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

/** A soft bell for every heart she taps — tuned to sit on top of the ambient pad. */
let chimeCtx: AudioContext | null = null
export function playHeartChime(big = false) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    if (!chimeCtx) chimeCtx = new Ctx()
    const ctx = chimeCtx
    if (ctx.state === 'suspended') ctx.resume()
    const scale = [783.99, 880.0, 987.77, 1174.66, 1318.51]
    const notes = big ? [scale[0], scale[2], scale[4]] : [scale[Math.floor(Math.random() * scale.length)]]
    notes.forEach((f, i) => {
      const t = ctx.currentTime + i * 0.09
      ;[1, 2].forEach((mult, k) => {
        const o = ctx.createOscillator()
        o.type = 'sine'
        o.frequency.value = f * mult
        const g = ctx.createGain()
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(k === 0 ? 0.05 : 0.015, t + 0.015)
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3)
        o.connect(g)
        g.connect(ctx.destination)
        o.start(t)
        o.stop(t + 1.4)
      })
    })
  } catch {
    /* audio is a nicety; ignore failures */
  }
}

function sharedCtx() {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext
  if (!Ctx) return null
  if (!chimeCtx) chimeCtx = new Ctx()
  if (chimeCtx.state === 'suspended') chimeCtx.resume()
  return chimeCtx
}

/** A warm swelling tone while she holds the heart — rises in pitch as it charges. */
export function startChargeTone() {
  try {
    const ctx = sharedCtx()
    if (!ctx) return null
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 0.3)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 600
    const o1 = ctx.createOscillator()
    const o2 = ctx.createOscillator()
    o1.type = 'sine'
    o2.type = 'triangle'
    o1.frequency.value = 220
    o2.frequency.value = 330
    o1.connect(lp)
    o2.connect(lp)
    lp.connect(g)
    g.connect(ctx.destination)
    o1.start()
    o2.start()
    return {
      set(p: number) {
        const t = ctx.currentTime
        o1.frequency.setTargetAtTime(220 + p * 220, t, 0.05)
        o2.frequency.setTargetAtTime(330 + p * 330, t, 0.05)
        lp.frequency.setTargetAtTime(600 + p * 1800, t, 0.05)
        g.gain.setTargetAtTime(0.035 + p * 0.03, t, 0.05)
      },
      stop() {
        const t = ctx.currentTime
        g.gain.cancelScheduledValues(t)
        g.gain.setTargetAtTime(0, t, 0.08)
        o1.stop(t + 0.5)
        o2.stop(t + 0.5)
      },
    }
  } catch {
    return null
  }
}

/** A harp-like glissando for the rose shower. */
export function playRoseShower(p = 1) {
  try {
    const ctx = sharedCtx()
    if (!ctx) return
    const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98]
    const count = Math.max(4, Math.round(notes.length * p))
    for (let i = 0; i < count; i++) {
      const t = ctx.currentTime + i * 0.07
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = notes[i]
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.045, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8)
      o.connect(g)
      g.connect(ctx.destination)
      o.start(t)
      o.stop(t + 1.9)
    }
  } catch {}
}

/** A soft "mwah": a short breathy pop followed by a tiny sparkle. */
export function playKiss() {
  try {
    const ctx = sharedCtx()
    if (!ctx) return
    const t = ctx.currentTime
    const len = 0.22
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) {
      const k = i / d.length
      d[i] = (Math.random() * 2 - 1) * Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.4)), 2) * (1 - k)
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 3
    bp.frequency.setValueAtTime(700, t)
    bp.frequency.exponentialRampToValueAtTime(2200, t + len)
    const g = ctx.createGain()
    g.gain.value = 0.5
    src.connect(bp)
    bp.connect(g)
    g.connect(ctx.destination)
    src.start(t)
    // lip "pop"
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(380, t + 0.12)
    o.frequency.exponentialRampToValueAtTime(900, t + 0.2)
    const og = ctx.createGain()
    og.gain.setValueAtTime(0, t + 0.12)
    og.gain.linearRampToValueAtTime(0.06, t + 0.14)
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.26)
    o.connect(og)
    og.connect(ctx.destination)
    o.start(t + 0.12)
    o.stop(t + 0.3)
    // sparkle
    ;[1567.98, 2093].forEach((f, i) => {
      const s = ctx.createOscillator()
      s.type = 'sine'
      s.frequency.value = f
      const sg = ctx.createGain()
      const st = t + 0.28 + i * 0.08
      sg.gain.setValueAtTime(0, st)
      sg.gain.linearRampToValueAtTime(0.03, st + 0.01)
      sg.gain.exponentialRampToValueAtTime(0.0001, st + 0.9)
      s.connect(sg)
      sg.connect(ctx.destination)
      s.start(st)
      s.stop(st + 1)
    })
  } catch {}
}
