// src/components/related-kits.tsx
// 관련 킷 표시 컴포넌트

'use client'

import { useEffect, useState } from 'react'
import { KitCard } from './kit-card'
import type { KitListItem } from '@/lib/types'

interface RelatedKitsProps {
  kitId: string
}

interface RelatedKitsData {
  variant: KitListItem[]
  series: KitListItem[]
  similar: KitListItem[]
}

export function RelatedKits({ kitId }: RelatedKitsProps) {
  const [relatedKits, setRelatedKits] = useState<RelatedKitsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRelatedKits()
  }, [kitId])

  async function fetchRelatedKits() {
    try {
      setLoading(true)
      const response = await fetch(`/api/kits/${kitId}/related`)
      
      if (!response.ok) {
        throw new Error('관련 킷을 불러오는데 실패했습니다')
      }

      const result = await response.json()
      setRelatedKits(result.data)
    } catch (error) {
      console.error('Failed to fetch related kits:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        <p className="mt-2 text-muted-foreground text-sm">관련 킷 로딩 중...</p>
      </div>
    )
  }

  if (!relatedKits) {
    return null
  }

  const hasRelatedKits = 
    relatedKits.variant.length > 0 || 
    relatedKits.series.length > 0 || 
    relatedKits.similar.length > 0

  if (!hasRelatedKits) {
    return null
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">관련 킷</h2>

      {/* 변형 모델 */}
      {relatedKits.variant.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold">변형 모델</h3>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              {relatedKits.variant.length}개
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {relatedKits.variant.map((kit) => (
              <KitCard key={kit.id} kit={kit} />
            ))}
          </div>
        </section>
      )}

      {/* 같은 시리즈 */}
      {relatedKits.series.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold">같은 시리즈</h3>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              {relatedKits.series.length}개
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {relatedKits.series.map((kit) => (
              <KitCard key={kit.id} kit={kit} />
            ))}
          </div>
        </section>
      )}

      {/* 비슷한 킷 */}
      {relatedKits.similar.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold">이런 킷은 어때요?</h3>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              {relatedKits.similar.length}개
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {relatedKits.similar.map((kit) => (
              <KitCard key={kit.id} kit={kit} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
