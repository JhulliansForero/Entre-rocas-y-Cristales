export default function Spinner({ size = 'md' }) {
  const px = { sm: 16, md: 32, lg: 48 }[size] ?? 32
  return (
    <div
      role="status"
      aria-label="Cargando"
      style={{
        width: px, height: px, borderRadius: '50%',
        border: `${px * .1}px solid var(--color-bone)`,
        borderTopColor: 'var(--color-forest)',
        animation: 'spin .7s linear infinite',
      }}
    />
  )
}
