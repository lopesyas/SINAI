/**
 * Fundo decorativo sutil — padrão geométrico de pontos azuis translúcidos.
 * Usado com moderação, nunca atrás de texto ou botões.
 */
export function GeometricBackground({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(47,111,237,0.07) 1.5px, transparent 1.5px)',
        backgroundSize: '28px 28px',
      }}
    />
  )
}
