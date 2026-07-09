export function Logo({ size = 'md', light = false }) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 40, text: 'text-2xl' },
    lg: { icon: 56, text: 'text-4xl' },
  }
  const { icon, text } = sizes[size] || sizes.md
  const color = light ? '#FFFFFF' : '#14275E'

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Ícone: mão em Libras estilizada + onda de som */}
      <svg width={icon} height={icon} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect width="48" height="48" rx="12" fill="#2F6FED" />
        {/* Mão simplificada */}
        <path
          d="M14 32 C14 32 12 28 12 24 C12 20 15 18 18 18 C18 18 18 16 20 16 C22 16 22 18 22 18 C22 18 22 16 24 16 C26 16 26 18 26 18 C26 18 26 16 28 16 C30 16 30 20 30 20 L30 28 C30 30 28 32 26 32 Z"
          fill="white"
          opacity="0.95"
        />
        {/* Dedo indicador apontado */}
        <rect x="26" y="12" width="4" height="10" rx="2" fill="white" opacity="0.95" />
        {/* Ondas de comunicação */}
        <path d="M34 18 Q38 22 34 26" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M36 15 Q42 22 36 29" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      </svg>

      <span
        className={`font-display font-extrabold tracking-tight ${text}`}
        style={{ color, fontFamily: 'Nunito, system-ui, sans-serif' }}
      >
        SINAI
      </span>
    </div>
  )
}
