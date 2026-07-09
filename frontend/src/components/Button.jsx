export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-[14px] transition-all duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 active:scale-95 select-none cursor-pointer'

  const variants = {
    primary:
      'bg-[#2F6FED] text-white hover:bg-[#1a5cd4] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
    secondary:
      'bg-white text-[#14275E] border-2 border-[#14275E] hover:bg-[#f0f4ff] disabled:opacity-50',
    ghost:
      'bg-transparent text-[#2F6FED] hover:bg-blue-50 disabled:opacity-50',
    danger:
      'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50',
    success:
      'bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
