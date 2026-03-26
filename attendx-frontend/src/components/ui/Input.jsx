/**
 * AttendX — UI Input Component
 * Styled form input with label.
 */
export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-300"
        >
          {label}
          {required && <span className="text-coral-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 rounded-lg
          bg-slate-800 border border-slate-700
          text-slate-100 placeholder-slate-500
          focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-default text-sm
          ${error ? 'border-coral-500' : ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-coral-400">{error}</p>
      )}
    </div>
  );
}
