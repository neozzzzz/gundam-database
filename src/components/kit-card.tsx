// src/components/kit-card.tsx
// 건담 킷 카드 컴포넌트 - Threads 스타일

'use client'

import Link from 'next/link'
import type { KitListItem } from '@/lib/types'

interface KitCardProps {
  kit: KitListItem
}

export function KitCard({ kit }: KitCardProps) {
  // kit_images 배열에서 첫 번째 이미지 가져오기
  const images = (kit as any).kit_images || kit.images
  const primaryImage = images && images.length > 0 
    ? images.find((img: any) => img.is_primary) || images[0]
    : null

  return (
    <Link href={`/kits/${kit.id}`}>
      <div className="card-threads group cursor-pointer">
        {/* 이미지 영역 */}
        <div className="relative aspect-square mb-4 bg-secondary rounded-xl overflow-hidden">
          {primaryImage?.image_url ? (
            <img
              src={primaryImage.image_url}
              alt={kit.name_ko}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-6xl mb-2">🤖</div>
                <div className="text-sm">이미지 없음</div>
              </div>
            </div>
          )}
          
          {/* P-BANDAI 뱃지 */}
          {kit.is_pbandai && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              P-BANDAI
            </div>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="space-y-2">
          {/* 등급 & 브랜드 */}
          <div className="flex items-center gap-2 text-sm">
            {kit.grade && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-semibold">
                {kit.grade.code}
              </span>
            )}
            {kit.brand && (
              <span className="text-muted-foreground">
                {kit.brand.name}
              </span>
            )}
          </div>

          {/* 킷 이름 */}
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {kit.name_ko}
          </h3>

          {/* 시리즈 */}
          {kit.series && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {kit.series.name_ko}
            </p>
          )}

          {/* 가격 & 출시일 */}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
            <div className="font-semibold">
              {kit.price_krw 
                ? `₩${kit.price_krw.toLocaleString()}` 
                : '가격 미정'
              }
            </div>
            {kit.release_date && (
              <div className="text-muted-foreground">
                {new Date(kit.release_date).toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'short' 
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
