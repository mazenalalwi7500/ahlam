import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Starfield, FloatingHearts } from './Background'
import { playOpenSting, useAmbientMusic } from './audio'
import { AhlaamSignature, Bokeh, KissLayer, LoveHeart, LuxHeart, RainLayer, RosePetals, TapHearts, requestMotionPermission, useShakeRain } from './Romance'

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
  useShakeRain(opened)

  const handleOpen = () => {
    if (opened) return
    start() // start music on first interaction
    requestMotionPermission() // iOS: allow shake-to-rain
    setSealing(false)
    setHintGone(true)
    playOpenSting()
    window.setTimeout(() => setOpened(true), 1100)
  }

  return (
    <div className={`scene ${opened ? 'is-open' : ''}`}>
      <Bokeh />
      <Starfield />
      <RosePetals count={opened ? 22 : 14} />
      <FloatingHearts count={opened ? 22 : 12} />
      <RainLayer />
      <TapHearts />

      <div className="glow-ring" />

      <button
        className={`music-toggle ${playing ? 'playing' : ''}`}
        onClick={toggle}
        aria-label="الموسيقى"
      >
        {playing ? <MusicIcon /> : <MuteIcon />}
      </button>

      <AnimatePresence>
        {!opened && (
          <motion.div
            className="hint-name"
            initial={{ opacity: 0, y: -14, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
            transition={{ delay: 0.3, duration: 1.2 }}
          >
            <AhlaamSignature size="lg" delay={0.5} tagline="My Most Beautiful Dream" />
            <div className="hint-sub">لك ياحــلوم</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Envelope stage ---------- */}
      <div className={`stage ${opened ? '' : 'floating'}`}>
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
              <div className="letter-name letter-name-latin" dir="ltr" aria-label="Ahlaam">
                {'Ahlaam'.split('').map((ch, i) => (
                  <span key={i} className="ln-char" style={{ ['--i' as string]: i }}>{ch}</span>
                ))}
              </div>
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
                <div className="wax-ring" />
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
              <span className="msg-corner c-tl" />
              <span className="msg-corner c-tr" />
              <span className="msg-corner c-bl" />
              <span className="msg-corner c-br" />
              <motion.span
                className="msg-sheen"
                initial={{ x: '-120%' }}
                animate={{ x: '220%' }}
                transition={{ delay: 0.9, duration: 1.8, ease: 'easeInOut' }}
              />

              <motion.div
                className="msg-heart-pulse"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <LuxHeart size={44} />
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

              <AhlaamSignature size="sm" delay={1.1} />

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

              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.2, duration: 0.9, type: 'spring', bounce: 0.4 }}
              >
                <LoveHeart />
              </motion.div>

              <motion.div
                className="msg-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.6, duration: 0.8 }}
              >
                <KissLayer />
                <div className="shake-hint">📱 هزّي الجوال… وشوفي المطر</div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
