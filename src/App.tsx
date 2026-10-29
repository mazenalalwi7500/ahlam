import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Starfield, FloatingHearts } from './Background'
import { playOpenSting, useAmbientMusic } from './audio'

const HeartIcon = ({ size = 38, color = '#fffdf7' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 21s-7.5-4.7-10-9.3C.3 8.4 1.6 5 5 5c2 0 3.3 1.3 4 2.5C9.7 6.3 11 5 13 5c3.4 0 4.7 3.4 3 6.7C19.5 16.3 12 21 12 21z" />
  </svg>
)

const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
)

const MuteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
)

const RECIPIENT = 'أحلام'

export default function App() {
  const [opened, setOpened] = useState(false)
  const [sealing, setSealing] = useState(true)
  const { playing, toggle, start } = useAmbientMusic()
  const [hintGone, setHintGone] = useState(false)

  const handleOpen = () => {
    if (opened) return
    start() // start music on first interaction
    setSealing(false)
    setHintGone(true)
    playOpenSting()
    window.setTimeout(() => setOpened(true), 1100)
  }

  return (
    <div className="scene">
      <Starfield />
      <FloatingHearts count={opened ? 22 : 12} />

      <div className="glow-ring" />

      <button
        className={`music-toggle ${playing ? 'playing' : ''}`}
        onClick={toggle}
        aria-label="الموسيقى"
      >
        {playing ? <MusicIcon /> : <MuteIcon />}
      </button>

      {!opened && (
        <motion.div
          className="hint-name"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ delay: 1.4, duration: 1 }}
        >
          رسالة خاصة · {RECIPIENT}
        </motion.div>
      )}

      {/* ---------- Envelope stage ---------- */}
      <div className="stage">
        <motion.div
          className="envelope"
          onClick={handleOpen}
          style={{ cursor: opened ? 'default' : 'pointer' }}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={opened ? { opacity: 0, scale: 0.7, y: -30 } : { opacity: 1, y: 0, scale: 1 }}
          transition={opened ? { duration: 0.6, delay: 0.3 } : { duration: 1, delay: 0.2, type: 'spring', bounce: 0.3 }}
        >
          {/* Letter peeking from inside */}
          <motion.div
            className="letter"
            initial={{ y: 0 }}
            animate={opened ? { y: -340, opacity: 0 } : (sealing ? {} : { y: -18 })}
            transition={opened ? { duration: 0.7, delay: 0.1 } : { duration: 0.5 }}
          >
            <span className="letter-corner tl" />
            <span className="letter-corner tr" />
            <span className="letter-corner bl" />
            <span className="letter-corner br" />
            <div className="letter-inner">
              <div className="letter-greeting">جمعة مباركة</div>
              <div className="letter-name">{RECIPIENT}</div>
              <div className="letter-ornament">❀ ✦ ❀</div>
            </div>
          </motion.div>

          {/* Envelope body + pocket */}
          <div className="env-body" />
          <div className="env-pocket" />

          {/* Flap with wax seal */}
          <motion.div
            className="env-flap"
            initial={{ rotateX: 0 }}
            animate={opened ? { rotateX: 180 } : { rotateX: 0 }}
            transition={opened ? { duration: 1, ease: [0.4, 0, 0.2, 1] } : { duration: 0.6 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {sealing && !opened && (
              <motion.div
                className="wax-seal"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.9, type: 'spring', bounce: 0.5, duration: 0.8 }}
              >
                <div className="wax-disc" />
                <div className="wax-heart">
                  <HeartIcon size={38} color="#fffdf7" />
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* tap hint */}
      <AnimatePresence>
        {!hintGone && (
          <motion.div
            className="hint"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.85, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.8, duration: 1 }}
          >
            <span className="hint-icon">✦</span>
            <span style={{ margin: '0 6px' }}>افتحي الظرف</span>
            <span className="hint-icon">✦</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Full message overlay ---------- */}
      <AnimatePresence>
        {opened && (
          <motion.div
            className="message-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="message-card"
              initial={{ scale: 0.7, y: 40, opacity: 0, rotateX: -15 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.9, delay: 0.2, type: 'spring', bounce: 0.25 }}
              style={{ transformOrigin: 'center bottom' }}
            >
              <div className="msg-frame" />

              <motion.div
                className="msg-heart-pulse"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <HeartIcon size={44} color="#b23a48" />
              </motion.div>

              <motion.div
                className="msg-greeting"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
              >
                جمعة مباركة
              </motion.div>

              <motion.div
                className="msg-name"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.7 }}
              >
                {RECIPIENT}
              </motion.div>

              <motion.div
                className="msg-divider"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 1.05, duration: 0.8 }}
              >
                ❀
              </motion.div>

              <motion.div
                className="msg-body"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <p>جمعتك مباركة يا أرقّ كائن، وأسأل الله أن يملأ قلبك بالسكينة وأن يفرح يومك بأجمل ما تتمـني.</p>
                <p>أتمنى لكِ السعادة والراحة، وأن تمضي الأيام وأنتِ في أتمّ هدوء وطمأنينة، وتغمر روحك لحظات صافية تدوم.</p>
                <p>لو كان للجمال عنوان، لكان منسوب لضحكتك التي تشبه صفاء السماء ونقاء الطبيعة في أبهى صورها...</p>
              </motion.div>

              <motion.div
                className="msg-ornament"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.8 }}
              >
                ❀ ✦ ❀
              </motion.div>

              <motion.div
                className="msg-sign"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.8 }}
              >
                مختوم بقطرات ندى لأجل ألطف أحلام 🌿🌷
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
