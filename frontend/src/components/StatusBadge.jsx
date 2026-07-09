export function StatusBadge({ conectado, status }) {
  const dot = conectado ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
  const label = conectado
    ? status === 'em_andamento'
      ? 'Em atendimento'
      : status === 'finalizado'
      ? 'Finalizado'
      : 'Aguardando'
    : 'Desconectado'

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E2E2E] bg-white/70 px-3 py-1 rounded-full border border-gray-200">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
