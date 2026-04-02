const styles = {
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    animation: 'slideInResult 0.5s cubic-bezier(0.4,0,0.2,1)',
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '12px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    fontWeight: 300,
    fontStyle: 'italic',
    color: 'var(--charcoal)',
    letterSpacing: '0.01em',
  },
  badge: {
    background: 'var(--success)',
    color: 'var(--white)',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.1em',
    padding: '4px 12px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  imageWrap: {
    position: 'relative',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-strong)',
    background: 'var(--charcoal)',
    lineHeight: 0,
  },
  image: {
    width: '100%',
    display: 'block',
    borderRadius: 'var(--radius-lg)',
  },
  watermark: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    background: 'rgba(26,26,24,0.6)',
    backdropFilter: 'blur(8px)',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '11px',
    color: 'rgba(250,247,242,0.9)',
    letterSpacing: '0.06em',
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  downloadBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '13px 20px',
    background: 'var(--charcoal)',
    color: 'var(--ivory)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    transition: 'all var(--transition)',
    textDecoration: 'none',
  },
  tryAgainBtn: {
    padding: '13px 20px',
    background: 'transparent',
    color: 'var(--graphite)',
    border: '1.5px solid var(--dust)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    fontWeight: 400,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
}

export default function ResultPanel({ resultImage, onReset }) {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = resultImage
    link.download = `fitai-tryon-${Date.now()}.png`
    link.click()
  }

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.title}>Your look</h2>
        <span style={styles.badge}>✓ Ready</span>
      </div>

      <div style={styles.imageWrap}>
        <img src={resultImage} alt="Try-on result" style={styles.image} />
        <div style={styles.watermark}>FitAI · IDM-VTON</div>
      </div>

      <div style={styles.actions}>
        <button style={styles.downloadBtn} onClick={handleDownload}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </button>
        <button style={styles.tryAgainBtn} onClick={onReset}>
          Try another
        </button>
      </div>
    </div>
  )
}
