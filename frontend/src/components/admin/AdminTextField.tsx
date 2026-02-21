// src/components/admin/AdminTextField.tsx
// Admin 텍스트 입력 필드 컴포넌트

'use client'

import { ADMIN_STYLES } from '@/lib/constants/admin-config'

interface AdminTextFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: 'text' | 'number' | 'email' | 'url'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function AdminTextField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className = '',
}: AdminTextFieldProps) {
  return (
    <div className={className}>
      <label className={ADMIN_STYLES.label}>
        {label}
        {required && <span className={ADMIN_STYLES.required}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={ADMIN_STYLES.input}
      />
    </div>
  )
}
