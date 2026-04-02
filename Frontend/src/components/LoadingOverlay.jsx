const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(26,26,24,0.6)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeUp 0.3s ease',
  },
  card: {
    background: 'var(--ivory)',
    borderRadius: 'var(--radius-lg)',
    padding: '48px 56px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '28px',
    boxShadow: 'var(--shadow-strong)',
    maxWidth: '340px',
    width: '90%',
  },
  spinnerWrap: {
    position: 'relative',
    width: '64px',
    height: '64px',
  },
  ring: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '1.5px solid var(--gold)',
    animation: 'pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
  },
  ring2: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '1.5px solid var(--gold)',
    animation: 'pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) 0.5s infinite',
  },
  spinnerInner: {
    position: 'absolute',
    inset: '10px',
    border: '2px solid transparent',
    borderTopColor: 'var(--gold)',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite',
  },
  iconCenter: {
    position: 'absolute',
    inset: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: 400,
    color: 'var(--charcoal)',
    letterSpacing: '0.02em',
    textAlign: 'center',
  },
  text: {
    fontSize: '13px',
    color: 'var(--stone)',
    textAlign: 'center',
    lineHeight: 1.7,
    letterSpacing: '0.02em',
  },
  dots: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  dot: (delay) => ({
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: 'var(--gold)',
    animation: `breathe 1.2s ease ${delay}s infinite`,
  }),
}

export default function LoadingOverlay() {
  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        <div style={styles.spinnerWrap}>
          <div style={styles.ring} />
          <div style={styles.ring2} />
          <div style={styles.spinnerInner} />
          <div style={styles.iconCenter}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
        </div>

        <div>
          <p style={styles.title}>Styling your look</p>
        </div>

        <p style={styles.text}>
          Our AI is fitting the garment to your photo.<br />
          This may take 20–60 seconds.
        </p>

        <div style={styles.dots}>
          <div style={styles.dot(0)} />
          <div style={styles.dot(0.2)} />
          <div style={styles.dot(0.4)} />
        </div>
      </div>
    </div>
  )
}
