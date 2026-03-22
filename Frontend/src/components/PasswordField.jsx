import { useId, useState } from 'react'

export function PasswordField({
  id: idProp,
  name,
  label,
  autoComplete,
  placeholder,
  minLength,
  required,
}) {
  const [visible, setVisible] = useState(false)
  const reactId = useId()
  const inputId = idProp ?? reactId

  return (
    <div className="auth-field">
      <label htmlFor={inputId}>{label}</label>
      <div className="auth-input-wrap">
        <input
          id={inputId}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          required={required}
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}
