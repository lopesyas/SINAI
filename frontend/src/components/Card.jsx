/**
 * Card reutilizável — componente base da biblioteca visual SINAI.
 * Moldura bege arredondada, interior off-white, suporte a estado selecionado.
 */
export function Card({
  children,
  selected = false,
  onClick,
  className = '',
  hoverable = true,
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={[
        'rounded-[20px] border-2 transition-all duration-150 select-none',
        selected
          ? 'border-[#2F6FED] shadow-lg shadow-blue-200 scale-[1.02]'
          : 'border-[#F1E8D8]',
        hoverable && onClick
          ? 'cursor-pointer hover:border-[#2F6FED] hover:shadow-md hover:scale-[1.01] active:scale-95'
          : '',
        'bg-[#FFFDF8]',
        className,
      ].join(' ')}
      style={{ background: selected ? '#f0f6ff' : '#FFFDF8' }}
    >
      {children}
    </div>
  )
}

/**
 * Card de sintoma — versão compacta para a biblioteca visual do paciente.
 */
export function SymptomCard({ emoji, label, selected = false, onClick }) {
  return (
    <Card
      selected={selected}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-4 min-h-[100px]"
    >
      <span className="text-4xl leading-none" role="img" aria-label={label}>
        {emoji}
      </span>
      <span
        className="text-sm font-semibold text-center leading-tight"
        style={{ color: selected ? '#14275E' : '#2E2E2E', fontFamily: 'Nunito, sans-serif' }}
      >
        {label}
      </span>
    </Card>
  )
}
