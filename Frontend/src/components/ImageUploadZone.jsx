import { useState, useRef, useCallback } from 'react'

const styles = {
  zone: (isDragging, hasImage) => ({
    position: 'relative',
    width: '100%',
    aspectRatio: '3/4',
    border: `1.5px dashed ${isDragging ? 'var(--gold)' : hasImage ? 'transparent' : 'var(--dust)'}`,
    borderRadius: 'var(--radius-lg)',
    background: isDragging
      ? 'var(--gold-pale)'
      : hasImage
      ? 'transparent'
      : 'var(--ivory)',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all var(--transition)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isDragging ? '0 0 0 3px var(--gold-pale)' : hasImage ? 'var(--shadow-mid)' : 'none',
  }),
  preview: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 'var(--radius-lg)',
    display: 'block',
  },
  overlay: (visible) => ({
    position: 'absolute',
    inset: 0,
    background: 'rgba(26,26,24,0.55)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    opacity: visible ? 1 : 0,
    transition: 'opacity var(--transition)',
    cursor: 'pointer',
  }),
  overlayText: {
    color: 'var(--ivory)',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    fontWeight: 400,
    letterSpacing: '0.05em',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
    textAlign: 'center',
  },
  iconWrap: (isDragging) => ({
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: isDragging ? 'var(--gold-pale)' : 'var(--cream)',
    border: `1px solid ${isDragging ? 'var(--gold)' : 'var(--dust)'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition)',
  }),
  label: {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontWeight: 400,
    color: 'var(--graphite)',
    letterSpacing: '0.02em',
  },
  hint: {
    fontSize: '12px',
    color: 'var(--stone)',
    letterSpacing: '0.04em',
  },
  badge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'var(--charcoal)',
    color: 'var(--ivory)',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    padding: '4px 10px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    zIndex: 2,
  },
  input: {
    display: 'none',
  },
}

export default function ImageUploadZone({ label, badge, image, onImageChange }) {
  const [isDragging, setIsDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef()

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    onImageChange({ file, url })
  }, [onImageChange])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  const onClick = () => inputRef.current?.click()

  const onInputChange = (e) => {
    const file = e.target.files[0]
    handleFile(file)
    e.target.value = ''
  }

  return (
    <div
      style={styles.zone(isDragging, !!image)}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={styles.input}
        onChange={onInputChange}
      />

      {image ? (
        <>
          <img src={image.url} alt={label} style={styles.preview} />
          <div style={styles.badge}>{badge}</div>
          <div style={styles.overlay(hovered)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ivory)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span style={styles.overlayText}>Replace image</span>
          </div>
        </>
      ) : (
        <div style={styles.placeholder}>
          <div style={styles.iconWrap(isDragging)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isDragging ? 'var(--gold)' : 'var(--stone)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div>
            <p style={styles.label}>{label}</p>
            <p style={{...styles.hint, marginTop: '4px'}}>
              {isDragging ? 'Release to upload' : 'Drop image or click to browse'}
            </p>
            <p style={{...styles.hint, marginTop: '2px'}}>JPG, PNG, WebP</p>
          </div>
        </div>
      )}
    </div>
  )
}
