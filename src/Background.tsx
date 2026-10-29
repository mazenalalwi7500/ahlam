import { useMemo } from 'react'
import { motion } from 'framer-motion'

const HeartShape = ({ size, color, opacity = 1 }: { size: number; color: string; opacity?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ opacity }}>
    <path d="M12 21s-7.5-4.7-10-9.3C.3 8.4 1.6 5 5 5c2 0 3.3 1.3 4 2.5C9.7 6.3 11 5 13 5c3.4 0 4.7 3.4 3 6.7C19.5 16.3 12 21 12 21z" />
  </svg>
)

export function Starfield({ count = 60 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 4,
        dur: Math.random() * 3 + 2,
      })),
    [count]
  )
  return (
    <div className="stars">
      {stars.map((s, i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: i % 5 === 0 ? '#f1d77a' : '#fff',
            boxShadow: `0 0 ${s.size * 3}px ${i % 5 === 0 ? '#d4af37' : '#fff'}`,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export function FloatingHearts({ count = 14 }: { count?: number }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        x: Math.random() * 100,
        size: Math.random() * 16 + 8,
        delay: Math.random() * 6,
        dur: Math.random() * 6 + 7,
        drift: (Math.random() - 0.5) * 60,
        color: ['#b23a48', '#d94a5c', '#d4af37', '#f1d77a'][Math.floor(Math.random() * 4)],
        opacity: Math.random() * 0.4 + 0.25,
      })),
    [count]
  )
  return (
    <>
      {hearts.map((h, i) => (
        <motion.div
          key={i}
          className="floating-heart"
          style={{ left: `${h.x}%`, bottom: -40 }}
          initial={{ y: 0, x: 0, opacity: 0 }}
          animate={{ y: [0, -window.innerHeight - 80], x: [0, h.drift, 0], opacity: [0, h.opacity, h.opacity, 0] }}
          transition={{ duration: h.dur, delay: h.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <HeartShape size={h.size} color={h.color} />
        </motion.div>
      ))}
    </>
  )
}
