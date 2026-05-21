export default function SectionEyebrow({ children, color = 'var(--color-moss)' }) {
  return (
    <span className="eyebrow-full" style={{ color }}>
      <span className="dot-rule" />
      {children}
      <span className="dot-rule" />
    </span>
  )
}
