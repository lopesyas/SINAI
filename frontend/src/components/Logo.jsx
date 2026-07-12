import sinaiIcon from '../assets/sinai-icon.png'

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
      <img src={sinaiIcon} alt="SINAI" width={icon} height={icon} className="object-contain" />

      <span
        className={`font-display font-extrabold tracking-tight ${text}`}
        style={{ color, fontFamily: 'Nunito, system-ui, sans-serif' }}
      >
        SINAI
      </span>
    </div>
  )
}
