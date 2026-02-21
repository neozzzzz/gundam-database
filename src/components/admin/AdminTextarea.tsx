// src/components/admin/AdminTextarea.tsx
// Admin 텍스트영역 컴포넌트

'use client'

import { ADMIN_STYLES } from '@/lib/constants/admin-config'

interface AdminTextareaProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function AdminTextarea({
  label,
  name,
  value,
  onChange,
  rows = 4,
  placeholder,
  required = false,
  disabled = false,
  className = '',
}: AdminTextareaProps) {
  return (
    <div className={className}>
      <label className={ADMIN_STYLES.label}>
        {label}
        {required && <span className={ADMIN_STYLES.required}>*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={ADMIN_STYLES.input}
      />
    </div>
  )
}
