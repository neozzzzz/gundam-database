// src/lib/admin/useAdminForm.ts
// Admin 폼 페이지 공용 Hook

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

export interface UseAdminFormConfig<T> {
  tableName: string
  redirectPath: string
  initialData: T
  itemName?: string // 예: "진영", "킷"
}

export interface UseAdminFormReturn<T> {
  formData: T
  setFormData: React.Dispatch<React.SetStateAction<T>>
  saving: boolean
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleSubmit: (e: React.FormEvent, validate?: (data: T) => string | null) => Promise<void>
  handleCreate: (data: T) => Promise<void>
  handleUpdate: (id: string, data: T) => Promise<void>
}

export function useAdminForm<T extends Record<string, any>>({
  tableName,
  redirectPath,
  initialData,
  itemName = '항목',
}: UseAdminFormConfig<T>): UseAdminFormReturn<T> {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState<T>(initialData)
  const [saving, setSaving] = useState(false)

  // 폼 필드 변경 핸들러
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }))
  }, [])

  // 생성
  const handleCreate = useCallback(async (data: T) => {
    const { error } = await supabase.from(tableName).insert(data as any)
    
    if (error) {
      logger.error(`${itemName} 생성 실패`, error, { tableName, data })
      throw error
    }
    
    logger.info(`${itemName} 생성 성공`, { tableName, data })
  }, [supabase, tableName, itemName])

  // 수정
  const handleUpdate = useCallback(async (id: string, data: T) => {
    const { error } = await supabase
      .from(tableName)
      .update(data as any)
      .eq('id', id)
    
    if (error) {
      logger.error(`${itemName} 수정 실패`, error, { tableName, id, data })
      throw error
    }
    
    logger.info(`${itemName} 수정 성공`, { tableName, id })
  }, [supabase, tableName, itemName])

  // 폼 제출 (생성/수정 공통)
  const handleSubmit = useCallback(async (
    e: React.FormEvent,
    validate?: (data: T) => string | null
  ) => {
    e.preventDefault()
    
    // 유효성 검사
    if (validate) {
      const error = validate(formData)
      if (error) {
        alert(error)
        return
      }
    }
    
    setSaving(true)
    
    try {
      // id가 있으면 수정, 없으면 생성
      if ('id' in formData && formData.id) {
        await handleUpdate(formData.id as string, formData)
        alert(`${itemName} 수정 완료`)
      } else {
        await handleCreate(formData)
        alert(`${itemName} 추가 완료`)
      }
      
      router.push(redirectPath)
    } catch (error: any) {
      alert(`오류: ${error.message || '알 수 없는 오류'}`)
    } finally {
      setSaving(false)
    }
  }, [formData, handleCreate, handleUpdate, router, redirectPath, itemName])

  return {
    formData,
    setFormData,
    saving,
    handleChange,
    handleSubmit,
    handleCreate,
    handleUpdate,
  }
}
