/**
 * AttendX — UI Button Component
 * Reusable button with variants.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  id,
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-default focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-coral-500 text-white hover:bg-coral-600 focus-visible:outline-coral-500 active:scale-[0.98]',
    secondary:
      'bg-slate-700 text-slate-100 hover:bg-slate-600 focus-visible:outline-slate-500 active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-slate-100',
    danger:
      'bg-red-500/10 text-coral-400 hover:bg-red-500/20',
    outline:
      'border border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
