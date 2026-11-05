import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { playHeartChime, playKiss, playRoseShower, startChargeTone } from './audio'

const HEART_PATH =
  'M12 21s-7.5-4.7-10-9.3C.3 8.4 1.6 5 5 5c2 0 3.3 1.3 4 2.5C9.7 6.3 11 5 13 5c3.4 0 4.7 3.4 3 6.7C19.5 16.3 12 21 12 21z'

/** Glossy, gradient-filled heart — looks like polished enamel. */
export function LuxHeart({ size = 48, glow = true }: { size?: number; glow?: boolean }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: 'visible', filter: glow ? 'drop-shadow(0 0 10px rgba(217,74,92,0.65))' : undefined }}>
      <defs>
        <radialGradient id={`hg${id}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ff8a9a" />
          <stop offset="45%" stopColor="#d94a5c" />
          <stop offset="100%" stopColor="#6e1a2b" />
        </radialGradient>
        <linearGradient id={`hs${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={HEART_PATH} fill={`url(#hg${id})`} stroke="#f1d77a" strokeWidth="0.35" strokeOpacity="0.8" />
      <ellipse cx="7.4" cy="8.6" rx="2.6" ry="1.5" transform="rotate(-30 7.4 8.6)" fill={`url(#hs${id})`} />
    </svg>
  )
}

const SmallHeart = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d={HEART_PATH} />
  </svg>
)

/* ------------------------------------------------------------------ */
/* Heart burst wherever she taps                                       */
/* ------------------------------------------------------------------ */
type Burst = { id: number; x: number; y: number; big: boolean }
const BURST_COLORS = ['#d94a5c', '#b23a48', '#ff8a9a', '#f1d77a', '#d4af37', '#ffd1d8']

function HeartBurst({ x, y, big }: Burst) {
  const parts = useMemo(() => {
    const n = big ? 16 : 9
    return Array.from({ length: n }).map((_, i) => {
      const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
      const d = (big ? 110 : 60) + Math.random() * (big ? 90 : 55)
      return {
        dx: Math.cos(a) * d,
        dy: Math.sin(a) * d,
        size: 7 + Math.random() * (big ? 14 : 9),
        color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
        rot: (Math.random() - 0.5) * 120,
        dur: 1.1 + Math.random() * 0.6,
      }
    })
  }, [big])
  const sparks = useMemo(
    () =>
      Array.from({ length: big ? 12 : 6 }).map(() => {
        const a = Math.random() * Math.PI * 2
        const d = 30 + Math.random() * (big ? 140 : 80)
        return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, s: 2 + Math.random() * 3, delay: Math.random() * 0.2 }
      }),
    [big]
  )
  const main = big ? 84 : 46

  return (
    <div className="burst" style={{ left: x, top: y }}>
      <motion.span
        className="burst-ring"
        initial={{ scale: 0.2, opacity: 0.9 }}
        animate={{ scale: big ? 3.2 : 2.2, opacity: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
      <motion.div
        style={{ position: 'absolute', marginLeft: -main / 2, marginTop: -main / 2 }}
        initial={{ scale: 0, opacity: 0, y: 0 }}
        animate={{ scale: [0, 1.3, 1, 1.12, 0.9], opacity: [0, 1, 1, 1, 0], y: [0, -10, -30, -70, -130] }}
        transition={{ duration: 1.8, times: [0, 0.18, 0.35, 0.55, 1], ease: 'easeOut' }}
      >
        <LuxHeart size={main} />
      </motion.div>
      {parts.map((p, i) => (
        <motion.div
          key={i}
          style={{ position: 'absolute', marginLeft: -p.size / 2, marginTop: -p.size / 2 }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.dx, y: [0, p.dy, p.dy + 40], scale: [0, 1, 0.6], opacity: [1, 1, 0], rotate: p.rot }}
          transition={{ duration: p.dur, ease: [0.16, 1, 0.3, 1] }}
        >
          <SmallHeart size={p.size} color={p.color} />
        </motion.div>
      ))}
      {sparks.map((s, i) => (
        <motion.span
          key={`s${i}`}
          className="burst-spark"
          style={{ width: s.s, height: s.s, marginLeft: -s.s / 2, marginTop: -s.s / 2 }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{ x: s.dx, y: s.dy, opacity: [0, 1, 0], scale: [0, 1.4, 0] }}
          transition={{ duration: 1, delay: s.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Tiny event bus so any component can trigger bursts / rain           */
/* ------------------------------------------------------------------ */
type RainKind = 'roses' | 'hearts'
export const fireBurst = (x: number, y: number, big = true) =>
  window.dispatchEvent(new CustomEvent('romance:burst', { detail: { x, y, big } }))
export const fireRain = (kind: RainKind, strength = 1) =>
  window.dispatchEvent(new CustomEvent('romance:rain', { detail: { kind, strength } }))

export function TapHearts() {
  const [bursts, setBursts] = useState<Burst[]>([])
  useEffect(() => {
    const add = (x: number, y: number, big: boolean, sound = true) => {
      const b: Burst = { id: performance.now() + Math.random(), x, y, big }
      setBursts((bs) => [...bs.slice(-7), b])
      if (sound) playHeartChime(big)
      window.setTimeout(() => setBursts((bs) => bs.filter((x) => x.id !== b.id)), 2200)
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.closest?.('.music-toggle, [data-no-burst]')) return
      add(e.clientX, e.clientY, !!t?.closest?.('[data-big-burst]'))
    }
    const onCustom = (e: Event) => {
      const d = (e as CustomEvent).detail
      add(d.x, d.y, d.big, false)
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('romance:burst', onCustom)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('romance:burst', onCustom)
    }
  }, [])
  return (
    <div className="tap-layer" aria-hidden>
      {bursts.map((b) => (
        <HeartBurst key={b.id} {...b} />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Falling rose petals                                                 */
/* ------------------------------------------------------------------ */
export function RosePetals({ count = 16 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: Math.random() * 100,
        size: 12 + Math.random() * 14,
        dur: 11 + Math.random() * 10,
        delay: -Math.random() * 22,
        sway: 30 + Math.random() * 90,
        spin: 3 + Math.random() * 4,
        tone: i % 3,
      })),
    [count]
  )
  return (
    <div className="petals" aria-hidden>
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal-fall"
          style={{ left: `${p.left}%`, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, ['--sway' as string]: `${p.sway}px` }}
        >
          <span
            className={`petal petal-${p.tone}`}
            style={{ width: p.size, height: p.size * 1.15, animationDuration: `${p.spin}s` }}
          />
        </span>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Soft golden bokeh + shooting stars                                  */
/* ------------------------------------------------------------------ */
export function Bokeh({ count = 12 }: { count?: number }) {
  const orbs = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 40 + Math.random() * 120,
        dur: 14 + Math.random() * 14,
        delay: -Math.random() * 20,
        rose: i % 3 === 0,
      })),
    [count]
  )
  return (
    <div className="bokeh" aria-hidden>
      {orbs.map((o, i) => (
        <span
          key={i}
          className={`orb ${o.rose ? 'orb-rose' : ''}`}
          style={{ left: `${o.x}%`, top: `${o.y}%`, width: o.s, height: o.s, animationDuration: `${o.dur}s`, animationDelay: `${o.delay}s` }}
        />
      ))}
      <span className="shooting-star" style={{ top: '12%', left: '78%', animationDelay: '3s' }} />
      <span className="shooting-star" style={{ top: '26%', left: '40%', animationDelay: '9s' }} />
      <span className="shooting-star" style={{ top: '6%', left: '20%', animationDelay: '15s' }} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* "Ahlaam" — hand-drawn gold-foil signature                           */
/* ------------------------------------------------------------------ */
export function AhlaamSignature({ size = 'lg', delay = 0, tagline }: { size?: 'lg' | 'sm'; delay?: number; tagline?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <div className={`signature signature-${size}`} style={{ ['--d' as string]: `${delay}s` }} dir="ltr">
      <svg viewBox="0 0 600 210" className="sig-svg">
        <defs>
          <linearGradient id={`gold${id}`} x1="0" y1="0" x2="1" y2="0.3" spreadMethod="reflect">
            <stop offset="0%" stopColor="#8a6a15" />
            <stop offset="30%" stopColor="#d4af37" />
            <stop offset="48%" stopColor="#fff4c9" />
            <stop offset="62%" stopColor="#f1d77a" />
            <stop offset="100%" stopColor="#a8841f" />
            <animateTransform attributeName="gradientTransform" type="translate" values="-1 0; 1 0" dur="5s" repeatCount="indefinite" />
          </linearGradient>
          <filter id={`glow${id}`} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter={`url(#glow${id})`}>
          <text x="300" y="128" textAnchor="middle" className="sig-text sig-stroke" stroke={`url(#gold${id})`}>
            Ahlaam
          </text>
          <text x="300" y="128" textAnchor="middle" className="sig-text sig-fill" fill={`url(#gold${id})`}>
            Ahlaam
          </text>
          <path
            className="sig-swash"
            d="M120 168 C 210 150, 300 182, 390 160 S 500 150, 520 156"
            stroke={`url(#gold${id})`}
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path className="sig-diamond" d="M300 178 l6 6 -6 6 -6 -6z" fill={`url(#gold${id})`} />
        </g>
      </svg>
      <span className="sig-twinkle t1">✦</span>
      <span className="sig-twinkle t2">✦</span>
      <span className="sig-twinkle t3">✧</span>
      {tagline && <div className="sig-tagline">{tagline}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* The love heart inside the letter                                    */
/* ------------------------------------------------------------------ */
const PHRASES = [
  'أنتِ أجمل أحلام..',
  'ثقي دايماً إن الجاي مخبي فرحة أكبر بكتير',
  'الحياة حلوة، وأحلى ما فيها إنه بكرة أجمل',
  'خلي عينك على النور، واملأ قلبك طاقة وأمل',
  'خلينا دائماً متطمنين؛ اللي جاي بيشبه جمال عيونك 😊',
  'قلبي يبتسم حين تبتسمين',
  'أنتِ السكينة في ضجيج الأيام',
  'كل الطرق الجميلة تؤدي إليكِ',
  'لو خُيّرتُ بين الأحلام… لاخترتُكِ أنتِ',
]

const CHARGE_MS = 2600

export function LoveHeart() {
  const [n, setN] = useState(0)
  const [charge, setCharge] = useState(0)
  const [holding, setHolding] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const hold = useRef<{ t0: number; raf: number; tone: ReturnType<typeof startChargeTone> } | null>(null)

  const begin = (e: React.PointerEvent) => {
    if (hold.current) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const tone = startChargeTone()
    const t0 = performance.now()
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / CHARGE_MS)
      setCharge(p)
      tone?.set(p)
      if (navigator.vibrate && p < 1 && Math.random() < 0.06) navigator.vibrate(8)
      if (hold.current) hold.current.raf = requestAnimationFrame(tick)
    }
    hold.current = { t0, raf: requestAnimationFrame(tick), tone }
    setHolding(true)
  }

  const end = (cancelled = false) => {
    const h = hold.current
    if (!h) return
    hold.current = null
    cancelAnimationFrame(h.raf)
    h.tone?.stop()
    const p = Math.min(1, (performance.now() - h.t0) / CHARGE_MS)
    setHolding(false)
    setCharge(0)
    if (cancelled) return
    const r = btnRef.current?.getBoundingClientRect()
    const cx = r ? r.left + r.width / 2 : innerWidth / 2
    const cy = r ? r.top + r.height / 2 : innerHeight / 2
    fireBurst(cx, cy, true)
    if (p > 0.22) {
      fireRain('roses', 0.4 + p * 0.9)
      playRoseShower(p)
      navigator.vibrate?.([30, 40, 60])
    } else {
      playHeartChime(true)
    }
    setN((v) => v + 1)
  }

  const scale = 1 + charge * 0.95
  const beat = holding ? Math.max(0.32, 1.5 - charge * 1.2) : 1.5

  return (
    <div className="love-heart-wrap">
      <div className="love-heart-stage" style={{ transform: `scale(${scale})` }}>
        <span className="love-charge-glow" style={{ opacity: charge, transform: `scale(${0.6 + charge})` }} />
        <motion.button
          ref={btnRef}
          type="button"
          data-no-burst
          className={`love-heart ${holding ? 'is-holding' : ''}`}
          aria-label="قلب — اضغطي مطوّلاً"
          onPointerDown={begin}
          onPointerUp={() => end()}
          onPointerCancel={() => end(true)}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              const r = btnRef.current!.getBoundingClientRect()
              fireBurst(r.left + r.width / 2, r.top + r.height / 2, true)
              fireRain('roses', 1)
              playRoseShower(1)
              setN((v) => v + 1)
            }
          }}
          animate={{ scale: [1, 1.1, 1, 1.16, 1] }}
          transition={{ duration: beat, repeat: Infinity, times: [0, 0.12, 0.26, 0.4, 1], ease: 'easeInOut' }}
        >
          <span className="love-aura" style={{ animationDuration: `${beat * 1.6}s` }} />
          <span className="love-aura a2" style={{ animationDuration: `${beat * 1.6}s`, animationDelay: `${beat * 0.8}s` }} />
          <LuxHeart size={64} />
        </motion.button>
      </div>
      <div className="love-charge-bar" style={{ opacity: holding ? 1 : 0 }}>
        <span style={{ transform: `scaleX(${charge})` }} />
      </div>
      <div className="love-phrase-slot">
        <AnimatePresence mode="wait">
          <motion.div
            key={n}
            className={`love-phrase ${n === 0 ? 'is-hint' : ''}`}
            initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
            transition={{ duration: 0.6 }}
          >
            {n === 0 ? 'المسي القلب… أو اضغطي عليه مطوّلاً' : PHRASES[(n - 1) % PHRASES.length]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Rain of roses / hearts (long-press release, phone shake)            */
/* ------------------------------------------------------------------ */
type Drop = { id: number; kind: 'rose' | 'heart' | 'petal'; x: number; size: number; dur: number; delay: number; rot: number; sway: number; tone: number }

export function RainLayer() {
  const [drops, setDrops] = useState<Drop[]>([])
  useEffect(() => {
    const onRain = (e: Event) => {
      const { kind, strength } = (e as CustomEvent).detail as { kind: RainKind; strength: number }
      const count = Math.round((kind === 'roses' ? 34 : 40) * strength)
      const base = performance.now()
      const fresh: Drop[] = Array.from({ length: count }).map((_, i) => {
        const r = Math.random()
        const k: Drop['kind'] = kind === 'roses' ? (r < 0.55 ? 'rose' : 'petal') : r < 0.6 ? 'heart' : 'petal'
        return {
          id: base + i + Math.random(),
          kind: k,
          x: Math.random() * 100,
          size: k === 'rose' ? 22 + Math.random() * 20 : k === 'heart' ? 14 + Math.random() * 22 : 12 + Math.random() * 12,
          dur: 3.2 + Math.random() * 2.6,
          delay: Math.random() * 1.4,
          rot: (Math.random() - 0.5) * 540,
          sway: (Math.random() - 0.5) * 120,
          tone: i % 3,
        }
      })
      setDrops((d) => [...d.slice(-90), ...fresh])
      window.setTimeout(() => setDrops((d) => d.filter((x) => !fresh.includes(x))), 7000)
    }
    window.addEventListener('romance:rain', onRain)
    return () => window.removeEventListener('romance:rain', onRain)
  }, [])
  return (
    <div className="rain-layer" aria-hidden>
      {drops.map((d) => (
        <motion.div
          key={d.id}
          className="rain-drop"
          style={{ left: `${d.x}%` }}
          initial={{ y: '-10vh', x: 0, rotate: 0, opacity: 0 }}
          animate={{ y: '110vh', x: [0, d.sway, -d.sway * 0.5, d.sway * 0.3], rotate: d.rot, opacity: [0, 1, 1, 0.9, 0] }}
          transition={{ duration: d.dur, delay: d.delay, ease: [0.3, 0.1, 0.6, 1] }}
        >
          {d.kind === 'rose' && <span className="rain-rose" style={{ fontSize: d.size }}>🌹</span>}
          {d.kind === 'heart' && <LuxHeart size={d.size} glow={false} />}
          {d.kind === 'petal' && <span className={`petal petal-${d.tone}`} style={{ width: d.size, height: d.size * 1.15, animationDuration: '2.4s' }} />}
        </motion.div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Shake the phone → hearts & petals rain                              */
/* ------------------------------------------------------------------ */
/** iOS needs motion permission from a user gesture — call this on the first tap. */
export function requestMotionPermission() {
  const DME = (window as any).DeviceMotionEvent
  if (DME && typeof DME.requestPermission === 'function') {
    DME.requestPermission().catch(() => {})
  }
}

export function useShakeRain(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window.DeviceMotionEvent === 'undefined') return
    let last = { x: 0, y: 0, z: 0 }
    let energy = 0
    let cool = 0
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (!a || a.x == null || a.y == null || a.z == null) return
      const d = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z)
      last = { x: a.x, y: a.y, z: a.z }
      energy = energy * 0.85 + d
      const now = performance.now()
      if (energy > 90 && now > cool) {
        cool = now + 1800
        energy = 0
        fireRain('hearts', 1)
        playHeartChime(true)
        navigator.vibrate?.([20, 30, 20])
      }
    }
    window.addEventListener('devicemotion', onMotion)
    return () => window.removeEventListener('devicemotion', onMotion)
  }, [enabled])
}

/* ------------------------------------------------------------------ */
/* Kiss on the letter                                                  */
/* ------------------------------------------------------------------ */
function LipPrint({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 100 62" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`lg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8557a" />
          <stop offset="55%" stopColor="#c8204f" />
          <stop offset="100%" stopColor="#8e1238" />
        </linearGradient>
        <radialGradient id={`gl${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={`tx${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.5" result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#tx${id})`}>
        {/* upper lip */}
        <path
          d="M4 31 C 12 20, 26 9, 39 11 C 44 12, 47 15, 50 19 C 53 15, 56 12, 61 11 C 74 9, 88 20, 96 31 C 82 28.5, 66 27, 50 30 C 34 27, 18 28.5, 4 31 Z"
          fill={`url(#lg${id})`}
        />
        {/* lower lip */}
        <path
          d="M6 33 C 20 33.5, 35 32.5, 50 34.5 C 65 32.5, 80 33.5, 94 33 C 86 49, 69 58, 50 58 C 31 58, 14 49, 6 33 Z"
          fill={`url(#lg${id})`}
        />
        {/* lip creases */}
        <g stroke="#fbf3e4" strokeOpacity="0.55" strokeWidth="0.7" strokeLinecap="round" fill="none">
          <path d="M30 37 Q 31 45 33 52" />
          <path d="M38 37 Q 38.5 46 40 55" />
          <path d="M46 37 Q 46 47 46.5 56" />
          <path d="M54 37 Q 54 47 53.5 56" />
          <path d="M62 37 Q 61.5 46 60 55" />
          <path d="M70 37 Q 69 45 67 52" />
          <path d="M28 24 Q 29 19 31 15" />
          <path d="M37 26 Q 37.5 20 39 14" />
          <path d="M63 26 Q 62.5 20 61 14" />
          <path d="M72 24 Q 71 19 69 15" />
        </g>
      </g>
      {/* gloss */}
      <ellipse cx="38" cy="44" rx="10" ry="3.2" fill={`url(#gl${id})`} />
      <ellipse cx="64" cy="20" rx="7" ry="2.2" fill={`url(#gl${id})`} opacity="0.8" />
    </svg>
  )
}

type Kiss = { id: number; top: number; left: number; rot: number; size: number }

export function KissLayer() {
  const [kisses, setKisses] = useState<Kiss[]>([])
  const anchor = useRef<HTMLSpanElement>(null)
  const [card, setCard] = useState<HTMLElement | null>(null)
  useEffect(() => setCard(anchor.current?.closest('.message-card') as HTMLElement | null), [])

  const kiss = (e: React.MouseEvent) => {
    if (!card) return
    const w = card.clientWidth
    const size = 74 + Math.random() * 30
    const top = card.scrollTop + 60 + Math.random() * Math.max(40, card.clientHeight - 160)
    const left = 24 + Math.random() * Math.max(10, w - size - 48)
    setKisses((k) => [...k.slice(-7), { id: performance.now(), top, left, rot: (Math.random() - 0.5) * 50, size }])
    playKiss()
    navigator.vibrate?.(25)
    fireBurst(e.clientX, e.clientY, false)
  }

  return (
    <>
      <span ref={anchor} style={{ display: 'none' }} />
      {card && createPortal(kisses.map((k) => (
        <motion.div
          key={k.id}
          className="kiss-mark"
          style={{ top: k.top, left: k.left, width: k.size, height: k.size * 0.62 }}
          initial={{ scale: 1.9, opacity: 0, rotate: k.rot - 12, filter: 'blur(4px)' }}
          animate={{ scale: [1.9, 0.92, 1], opacity: [0, 1, 0.92], rotate: k.rot, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, times: [0, 0.7, 1], ease: 'easeOut' }}
        >
          <LipPrint id={String(Math.round(k.id))} />
          <span className="kiss-sparkle">✦</span>
        </motion.div>
      )), card)}
      <motion.button
        type="button"
        data-no-burst
        className="kiss-btn"
        onClick={kiss}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <span className="kiss-btn-icon">💋</span>
        <span>أرسلي قُبلة</span>
      </motion.button>
    </>
  )
}
