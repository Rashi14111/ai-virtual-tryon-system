import { useState, useCallback } from 'react'
import ImageUploadZone from './components/ImageUploadZone'
import LoadingOverlay from './components/LoadingOverlay'
import ResultPanel from './components/ResultPanel'

const API_URL = 'http://localhost:8000'

/* ─── Styles ───────────────────────────────────────────────────────────────── */
const s = {
  root: {
    minHeight: '100vh',
    background: 'var(--cream)',
    display: 'flex',
    flexDirection: 'column',
  },

  /* Header */
  header: {
    borderBottom: '1px solid var(--dust)',
    background: 'var(--ivory)',
    padding: '0 40px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'var(--charcoal)',
  },
  logoAccent: {
    color: 'var(--gold)',
  },
  navTag: {
    fontSize: '11px',
    letterSpacing: '0.1em',
    color: 'var(--stone)',
    textTransform: 'uppercase',
    border: '1px solid var(--dust)',
    padding: '4px 12px',
    borderRadius: '20px',
  },

  /* Main layout */
  main: {
    flex: 1,
    maxWidth: '1100px',
    margin: '0 auto',
    width: '100%',
    padding: '52px 32px 80px',
    animation: 'fadeUp 0.5s ease',
  },

  /* Hero */
  hero: {
    marginBottom: '56px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  eyebrow: {
    fontSize: '11px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--gold)',
    fontWeight: 500,
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(38px, 5vw, 60px)',
    fontWeight: 300,
    lineHeight: 1.1,
    color: 'var(--charcoal)',
    letterSpacing: '-0.01em',
  },
  heroItalic: {
    fontStyle: 'italic',
    color: 'var(--gold)',
  },
  heroSub: {
    fontSize: '14px',
    color: 'var(--stone)',
    marginTop: '4px',
    letterSpacing: '0.02em',
    maxWidth: '500px',
    lineHeight: 1.7,
  },

  /* Grid */
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1.2fr',
    gap: '28px',
    alignItems: 'start',
  },

  /* Upload columns */
  uploadCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  colLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  colNumber: {
    width: '22px',
    height: '22px',
    background: 'var(--charcoal)',
    color: 'var(--ivory)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 500,
    flexShrink: 0,
  },
  colTitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '0.05em',
    color: 'var(--graphite)',
    textTransform: 'uppercase',
  },

  /* Action column */
  actionCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    paddingTop: '36px',
  },

  /* Divider arrow */
  arrow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 'calc(50% + 36px)',
    color: 'var(--dust)',
  },

  /* Try-on button */
  tryonBtn: (ready) => ({
    width: '100%',
    padding: '18px 24px',
    background: ready
      ? 'linear-gradient(135deg, var(--charcoal) 0%, var(--graphite) 100%)'
      : 'var(--dust)',
    color: ready ? 'var(--ivory)' : 'var(--stone)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontWeight: 400,
    fontStyle: ready ? 'italic' : 'normal',
    letterSpacing: '0.03em',
    cursor: ready ? 'pointer' : 'not-allowed',
    transition: 'all var(--transition)',
    boxShadow: ready ? 'var(--shadow-mid)' : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  }),

  /* Steps info */
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '20px',
    background: 'var(--ivory)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--dust)',
  },
  stepTitle: {
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--stone)',
    fontWeight: 500,
    marginBottom: '4px',
  },
  step: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  stepDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--gold)',
    marginTop: '7px',
    flexShrink: 0,
  },
  stepText: {
    fontSize: '12px',
    color: 'var(--stone)',
    lineHeight: 1.6,
  },

  /* Error */
  error: {
    padding: '16px 20px',
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 'var(--radius-md)',
    color: 'var(--error)',
    fontSize: '13px',
    lineHeight: 1.6,
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },

  /* Footer */
  footer: {
    borderTop: '1px solid var(--dust)',
    padding: '20px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: '12px',
    color: 'var(--stone)',
    letterSpacing: '0.03em',
  },
  model: {
    fontSize: '11px',
    color: 'var(--dust)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
}

/* ─── App ───────────────────────────────────────────────────────────────────── */
export default function App() {
  const [personImage, setPersonImage] = useState(null)
  const [clothImage, setClothImage]   = useState(null)
  const [isLoading, setIsLoading]     = useState(false)
  const [resultImage, setResultImage] = useState(null)
  const [error, setError]             = useState(null)

  const isReady = personImage && clothImage

  const handleTryOn = useCallback(async () => {
    if (!isReady || isLoading) return
    setError(null)
    setIsLoading(true)
    setResultImage(null)

    try {
      const formData = new FormData()
      formData.append('person_image', personImage.file)
      formData.append('cloth_image', clothImage.file)

      const res = await fetch(`${API_URL}/tryon`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || `Server error (${res.status})`)
      }

      if (data.success && data.result_image) {
        setResultImage(data.result_image)
      } else {
        throw new Error(data.message || 'Unexpected response from server')
      }
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot reach the backend. Make sure the FastAPI server is running on port 8000.')
      } else {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }, [personImage, clothImage, isLoading, isReady])

  const handleReset = () => {
    setResultImage(null)
    setError(null)
  }

  return (
    <div style={s.root}>
      {isLoading && <LoadingOverlay />}

      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>
          Fit<span style={s.logoAccent}>AI</span>
        </div>
        <span style={s.navTag}>Virtual Try-On · IDM-VTON</span>
      </header>

      {/* Main */}
      <main style={s.main}>
        {/* Hero */}
        <div style={s.hero}>
          <p style={s.eyebrow}>AI-Powered Fashion</p>
          <h1 style={s.heroTitle}>
            See it on you,{' '}
            <span style={s.heroItalic}>before you wear it</span>
          </h1>
          <p style={s.heroSub}>
            Upload a photo of yourself and a garment — our AI will show you exactly how it looks on your body, instantly.
          </p>
        </div>

        {/* Upload + Result Grid */}
        {resultImage ? (
          <div style={{ ...s.grid, gridTemplateColumns: '1fr 1fr 1.3fr' }}>
            {/* Keep original uploads visible */}
            <div style={s.uploadCol}>
              <div style={s.colLabel}>
                <div style={s.colNumber}>1</div>
                <span style={s.colTitle}>Person</span>
              </div>
              <ImageUploadZone
                label="Upload Person Image"
                badge="Person"
                image={personImage}
                onImageChange={setPersonImage}
              />
            </div>

            <div style={s.uploadCol}>
              <div style={s.colLabel}>
                <div style={s.colNumber}>2</div>
                <span style={s.colTitle}>Garment</span>
              </div>
              <ImageUploadZone
                label="Upload Clothing Image"
                badge="Garment"
                image={clothImage}
                onImageChange={setClothImage}
              />
            </div>

            <ResultPanel resultImage={resultImage} onReset={handleReset} />
          </div>
        ) : (
          <div style={s.grid}>
            {/* Person upload */}
            <div style={s.uploadCol}>
              <div style={s.colLabel}>
                <div style={s.colNumber}>1</div>
                <span style={s.colTitle}>Person</span>
              </div>
              <ImageUploadZone
                label="Upload Person Image"
                badge="Person"
                image={personImage}
                onImageChange={setPersonImage}
              />
            </div>

            {/* Clothing upload */}
            <div style={s.uploadCol}>
              <div style={s.colLabel}>
                <div style={s.colNumber}>2</div>
                <span style={s.colTitle}>Garment</span>
              </div>
              <ImageUploadZone
                label="Upload Clothing Image"
                badge="Garment"
                image={clothImage}
                onImageChange={setClothImage}
              />
            </div>

            {/* Action column */}
            <div style={s.actionCol}>
              {error && (
                <div style={s.error}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:'1px'}}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                style={s.tryonBtn(isReady)}
                onClick={handleTryOn}
                disabled={!isReady || isLoading}
              >
                {isReady ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Try it on
                  </>
                ) : (
                  'Upload both images first'
                )}
              </button>

              <div style={s.steps}>
                <p style={s.stepTitle}>How it works</p>
                {[
                  'Upload a clear full-body photo of a person',
                  'Upload the garment on a plain background',
                  'AI fits the garment realistically onto the person',
                  'Download your styled result instantly',
                ].map((t, i) => (
                  <div key={i} style={s.step}>
                    <div style={s.stepDot} />
                    <span style={s.stepText}>{t}</span>
                  </div>
                ))}
              </div>

              {/* Model note */}
              <p style={{fontSize:'11px', color:'var(--dust)', letterSpacing:'0.04em', lineHeight:1.7}}>
                Powered by <strong>IDM-VTON</strong> via Hugging Face Spaces. First inference may take 30–60 s while the Space wakes up.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={s.footer}>
        <span style={s.footerText}>© 2024 FitAI — Virtual Try-On</span>
        <span style={s.model}>Model: yisol/IDM-VTON</span>
      </footer>
    </div>
  )
}
