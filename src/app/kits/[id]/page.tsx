// src/app/kits/[id]/page.tsx
// 건담 킷 상세 페이지

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { RelatedKits } from '@/components/related-kits'
import type { KitWithDetails } from '@/lib/types'

export default function KitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [kit, setKit] = useState<KitWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchKit(params.id as string)
    }
  }, [params.id])

  async function fetchKit(id: string) {
    try {
      setLoading(true)
      const response = await fetch(`/api/kits/${id}`)
      
      if (!response.ok) {
        throw new Error('킷 정보를 불러오는데 실패했습니다')
      }

      const result = await response.json()
      // kit_images를 images로 변환 (하위 호환성)
      const kitData = result.data
      if (kitData.kit_images) {
        kitData.images = kitData.kit_images
      }
      setKit(kitData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error || !kit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-threads bg-red-900/20 border-red-900 text-center p-8 max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error || '킷을 찾을 수 없습니다'}</p>
          <button 
            onClick={() => router.push('/kits')}
            className="btn-primary"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/kits')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← 돌아가기
            </button>
            <h1 className="text-2xl font-bold">
              <a href="/" className="hover:text-primary transition-colors">
                Gundam Database
              </a>
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 이미지 */}
          <div className="space-y-4">
            {/* 메인 이미지 */}
            <div className="aspect-square bg-secondary rounded-2xl overflow-hidden">
              {(() => {
                // 1순위: box_art_url
                if (kit.box_art_url) {
                  return (
                    <img
                      src={kit.box_art_url}
                      alt={kit.name_ko}
                      className="w-full h-full object-cover"
                    />
                  )
                }
                // 2순위: kit_images
                if (kit.images?.[0]?.image_url) {
                  return (
                    <img
                      src={kit.images[0].image_url}
                      alt={kit.name_ko}
                      className="w-full h-full object-cover"
                    />
                  )
                }
                // 없으면 기본 아이콘
                return (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-9xl mb-4">🤖</div>
                      <div>이미지 없음</div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* 썸네일 이미지들 */}
            {kit.images && kit.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {kit.images.slice(0, 4).map((image, index) => (
                  <div
                    key={image.id}
                    className="aspect-square bg-secondary rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={image.image_url}
                      alt={`${kit.name_ko} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 정보 */}
          <div className="space-y-6">
            {/* 제목 영역 */}
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {kit.grade && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-bold text-sm">
                    {kit.grade.code}
                  </span>
                )}
                {kit.brand && (
                  <span className="px-3 py-1 bg-secondary text-foreground rounded-lg text-sm">
                    {kit.brand.name}
                  </span>
                )}
                {/* 진영 뱃지 */}
                {kit.mobile_suit?.faction && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
                    {kit.mobile_suit.faction}
                  </span>
                )}
                {/* 조직 뱃지 */}
                {kit.mobile_suit?.organization && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                    {kit.mobile_suit.organization}
                  </span>
                )}
                {kit.is_pbandai && (
                  <span className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold text-sm">
                    P-BANDAI
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-2">{kit.name_ko}</h1>
              {kit.name_en && (
                <p className="text-lg text-muted-foreground">{kit.name_en}</p>
              )}
            </div>

            {/* 기본 정보 */}
            <div className="card-threads space-y-3">
              {kit.series && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">시리즈</span>
                  <span className="font-medium">{kit.series.name_ko}</span>
                </div>
              )}
              
              {kit.mobile_suit && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">기체</span>
                  <span className="font-medium">{kit.mobile_suit.name_ko}</span>
                </div>
              )}

              {kit.scale && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">스케일</span>
                  <span className="font-medium">{kit.scale}</span>
                </div>
              )}

              {kit.release_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">출시일</span>
                  <span className="font-medium">
                    {new Date(kit.release_date).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}

              {kit.product_code && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">제품 코드</span>
                  <span className="font-medium">{kit.product_code}</span>
                </div>
              )}

              {kit.jan_code && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">JAN 코드</span>
                  <span className="font-mono text-sm font-medium">{kit.jan_code}</span>
                </div>
              )}
            </div>

            {/* 상세 사양 */}
            {kit.specifications && Object.keys(kit.specifications).length > 0 && (
              <div className="card-threads">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <span>📦</span>
                  <span>제품 사양</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {kit.specifications.runner_sheets && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">러너</div>
                      <div className="font-medium">{kit.specifications.runner_sheets}장</div>
                    </div>
                  )}
                  {kit.specifications.parts_count && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">부품 수</div>
                      <div className="font-medium">{kit.specifications.parts_count}개</div>
                    </div>
                  )}
                  {kit.specifications.manual_pages && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">설명서</div>
                      <div className="font-medium">{kit.specifications.manual_pages}페이지</div>
                    </div>
                  )}
                  {kit.specifications.poly_caps && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">폴리캡</div>
                      <div className="font-medium text-sm">{kit.specifications.poly_caps}</div>
                    </div>
                  )}
                </div>
                {kit.specifications.stickers && Array.isArray(kit.specifications.stickers) && kit.specifications.stickers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-xs text-muted-foreground mb-2">스티커</div>
                    <div className="flex flex-wrap gap-1.5">
                      {kit.specifications.stickers.map((sticker: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-secondary rounded text-xs">
                          {sticker}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {kit.specifications.special_parts && Array.isArray(kit.specifications.special_parts) && kit.specifications.special_parts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-xs text-muted-foreground mb-2">특수 부품</div>
                    <div className="flex flex-wrap gap-1.5">
                      {kit.specifications.special_parts.map((part: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 가격 */}
            <div className="card-threads bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-lg">가격</span>
                <span className="text-3xl font-bold text-primary">
                  {kit.price_krw 
                    ? `₩${kit.price_krw.toLocaleString()}` 
                    : '가격 미정'
                  }
                </span>
              </div>
              {kit.price_jpy && (
                <div className="text-sm text-muted-foreground mt-2">
                  일본 가격: ¥{kit.price_jpy.toLocaleString()}
                </div>
              )}
            </div>

            {/* 설명 */}
            {kit.description && (
              <div className="card-threads">
                <h3 className="font-bold mb-2">제품 설명</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {kit.description}
                </p>
              </div>
            )}

            {/* 구매 링크 */}
            {kit.purchase_links && kit.purchase_links.length > 0 && (
              <div className="card-threads">
                <h3 className="font-bold mb-3">구매하기</h3>
                <div className="space-y-2">
                  {kit.purchase_links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-accent transition-colors"
                    >
                      <span>{link.store?.name || '판매처'}</span>
                      <span className="text-primary">→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 관련 킷 섹션 */}
        <div className="mt-12">
          <RelatedKits kitId={kit.id} />
        </div>
      </div>
    </div>
  )
}
