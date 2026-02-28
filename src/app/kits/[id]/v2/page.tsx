// app/kits/[id]/v2/page.tsx
// V2 테스트: 같은 모빌슈트 킷을 연관 킷으로 표시
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function KitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [kit, setKit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPilotModal, setShowPilotModal] = useState(false)

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (showPilotModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showPilotModal])

  useEffect(() => {
    async function fetchKit() {
      try {
        const response = await fetch(`/api/kits/${params.id}/v2`)
        if (!response.ok) {
          throw new Error('Failed to fetch kit')
        }
        const data = await response.json()
        setKit(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchKit()
    }
  }, [params.id])

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

  // 이미지 가져오기
  const images = kit.kit_images || []
  const primaryImage = images.find((img: any) => img.is_primary) || images[0]
  const imageUrl = kit.box_art_url || primaryImage?.image_url

  // 모빌슈트 정보
  const mobileSuit = kit.mobile_suits || kit.mobile_suit

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-8">
        <button 
          onClick={() => router.push('/kits')}
          className="text-muted-foreground hover:text-foreground transition-colors text-base"
        >
          ← 목록으로
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 이미지 */}
          <div className="space-y-4">
            {/* 메인 이미지 */}
            <div className="aspect-[4/3] bg-secondary rounded-2xl overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={kit.name_ko}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <img 
                    src="/no-image.png" 
                    alt="이미지 없음"
                    className="w-2/5 h-2/5 object-contain invert opacity-30"
                  />
                </div>
              )}
            </div>

            {/* 썸네일 이미지들 */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(0, 4).map((image: any, index: number) => (
                  <div
                    key={index}
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
                {/* Grade 뱃지 */}
                {kit.grades && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-bold text-sm">
                    {kit.grades.code || kit.grades.name_ko || kit.grades.name}
                  </span>
                )}
                {/* Scale 뱃지 */}
                {kit.grades?.scale && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-bold text-sm">
                    {kit.grades.scale}
                  </span>
                )}
                {/* Series 뱃지 */}
                {kit.series && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-bold text-sm">
                    {kit.series.name_ko || kit.series.name}
                  </span>
                )}
                {/* Brand 뱃지 */}
                {kit.brand && (
                  <span className="px-3 py-1 bg-secondary text-foreground rounded-lg text-sm">
                    {kit.brand.name_ko || kit.brand.name}
                  </span>
                )}
                {/* 한정판 뱃지 - 동적 유형 */}
                {kit.limited_type && (
                  <span 
                    className="px-3 py-1 text-white rounded-lg font-bold text-sm"
                    style={{ backgroundColor: kit.limited_type.badge_color || '#DC2626' }}
                  >
                    {kit.limited_type.name_ko}
                  </span>
                )}
                {/* 하위 호환성: limited_type이 없고 is_pbandai만 있는 경우 */}
                {!kit.limited_type && kit.is_pbandai && (
                  <span className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold text-sm">
                    프리미엄 반다이
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-2">{kit.name_ko}</h1>
              {kit.name_en && (
                <p className="text-lg text-muted-foreground">{kit.name_en}</p>
              )}
            </div>

            {/* 제품 코드 정보 */}
            {(kit.bandai_product_code || kit.jan_code) && (
              <div className="card-threads space-y-3">
                {kit.bandai_product_code && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">제품 코드</span>
                    <span className="font-medium">{kit.bandai_product_code}</span>
                  </div>
                )}

                {kit.jan_code && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">JAN 코드</span>
                    <span className="font-mono text-sm font-medium">{kit.jan_code}</span>
                  </div>
                )}
              </div>
            )}

            {/* 모빌슈트 상세 정보 */}
            {mobileSuit && (
              <div className="card-threads">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                  </svg>
                  <span>모빌슈트 정보</span>
                </h3>
                <div className="space-y-3">
                  {/* 기체명 */}
                  {(mobileSuit.name_ko || mobileSuit.name) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">기체명</span>
                      <span className="font-medium">{mobileSuit.name_ko || mobileSuit.name}</span>
                    </div>
                  )}
                  {/* 영문명 */}
                  {mobileSuit.name_en && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">영문명</span>
                      <span className="font-medium text-muted-foreground">{mobileSuit.name_en}</span>
                    </div>
                  )}
                  {/* 모델 넘버 */}
                  {mobileSuit.model_number && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">모델 넘버</span>
                      <span className="font-mono text-blue-400 font-medium">{mobileSuit.model_number}</span>
                    </div>
                  )}
                  {/* 파일럿 */}
                  {mobileSuit.pilot && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">파일럿</span>
                      <button 
                        onClick={() => setShowPilotModal(true)}
                        className="px-2 py-0.5 rounded text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors cursor-pointer"
                      >
                        {mobileSuit.pilot.name_ko || mobileSuit.pilot.name_en || mobileSuit.pilot}
                      </button>
                    </div>
                  )}
                  {/* 진영 */}
                  {mobileSuit.factions && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">소속 진영</span>
                      <span 
                        className="px-2 py-0.5 rounded text-sm font-medium"
                        style={{ 
                          backgroundColor: mobileSuit.factions.color ? `${mobileSuit.factions.color}20` : '#3B82F620',
                          color: mobileSuit.factions.color || '#3B82F6'
                        }}
                      >
                        {mobileSuit.factions.name_ko || mobileSuit.factions.name}
                      </span>
                    </div>
                  )}
                  {/* 제조사 */}
                  {mobileSuit.company && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">제조사</span>
                      <span 
                        className="px-2 py-0.5 rounded text-sm font-medium"
                        style={{ 
                          backgroundColor: `${mobileSuit.company.color}20` || '#14B8A620',
                          color: mobileSuit.company.color || '#14B8A6'
                        }}
                      >
                        {mobileSuit.company.name_ko}
                      </span>
                    </div>
                  )}
                  {/* 전고 */}
                  {mobileSuit.height && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">전고</span>
                      <span className="font-medium">{mobileSuit.height}</span>
                    </div>
                  )}
                  {/* 중량 */}
                  {mobileSuit.weight && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">중량</span>
                      <span className="font-medium">{mobileSuit.weight}</span>
                    </div>
                  )}
                </div>
                {/* 설명 */}
                {mobileSuit.description && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {mobileSuit.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 시리즈 정보 */}
            {kit.series && (
              <div className="card-threads">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="7" width="20" height="15" rx="2" ry="2" strokeWidth="2"/>
                    <polyline points="17 2 12 7 7 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>시리즈 정보</span>
                </h3>
                <div className="space-y-3">
                  {/* 시리즈명 */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">시리즈명</span>
                    <span className="font-medium">{kit.series.name_ko}</span>
                  </div>
                  {/* 영문명 */}
                  {kit.series.name_en && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">영문명</span>
                      <span className="font-medium text-muted-foreground text-sm">{kit.series.name_en}</span>
                    </div>
                  )}
                  {/* 방영년도 */}
                  {kit.series.year_start && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">방영년도</span>
                      <span className="font-medium">{kit.series.year_start}년</span>
                    </div>
                  )}
                  {/* 형태 */}
                  {kit.series.media_type && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">형태</span>
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-sm font-medium">
                        {kit.series.media_type}
                      </span>
                    </div>
                  )}
                </div>
                {/* 추가 정보 */}
                {kit.series.additional_info && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {kit.series.additional_info}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 설명 */}
            {kit.description && (
              <div className="card-threads">
                <h3 className="font-bold mb-2">제품 설명</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {kit.description}
                </p>
              </div>
            )}

            {/* 출시일 & 가격 */}
            <div className="card-threads bg-primary/5 border-primary/20">
              <div className="space-y-4">
                {/* 출시일 */}
                {kit.release_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">출시일</span>
                    <span className="font-medium text-lg">
                      {new Date(kit.release_date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                {/* 가격 */}
                <div className={`flex items-center justify-between ${kit.release_date ? 'pt-3 border-t border-primary/10' : ''}`}>
                  <span className="text-lg font-medium">가격</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary">
                      {kit.price_krw 
                        ? `₩${kit.price_krw.toLocaleString()}` 
                        : '가격 미정'
                      }
                    </span>
                    {kit.price_jpy && (
                      <div className="text-sm text-muted-foreground mt-1">
                        ¥{kit.price_jpy.toLocaleString()} (税込)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 구매 링크 */}
            {kit.purchase_links && kit.purchase_links.length > 0 && (
              <div className="card-threads">
                <h3 className="font-bold mb-3">구매하기</h3>
                <div className="space-y-2">
                  {kit.purchase_links.map((link: any) => (
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

            {/* 관련 킷 */}
            {kit.related_kits && kit.related_kits.length > 0 && (
              <div className="card-threads">
                <h3 className="font-bold mb-4">관련 킷</h3>
                <div className="grid grid-cols-2 gap-3">
                  {kit.related_kits.map((relatedKit: any) => (
                    <a
                      key={relatedKit.id}
                      href={`/kits/${relatedKit.id}`}
                      className="group block card-threads p-0 overflow-hidden"
                    >
                      {/* 이미지 */}
                      <div className="aspect-square bg-secondary relative overflow-hidden">
                        {relatedKit.box_art_url ? (
                          <img
                            src={relatedKit.box_art_url}
                            alt={relatedKit.name_ko}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <img 
                              src="/no-image.png" 
                              alt="이미지 없음"
                              className="w-2/5 h-2/5 object-contain invert opacity-30"
                            />
                          </div>
                        )}
                        {/* 관계 유형 뱃지 */}
                        {relatedKit.relation_type && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                            {relatedKit.relation_type === 'same_mobile_suit' && '같은 MS'}
                            {relatedKit.relation_type === 'same_series' && '같은 시리즈'}
                            {relatedKit.relation_type === 'variant' && '바리에이션'}
                            {relatedKit.relation_type === 'upgrade' && '업그레이드'}
                            {relatedKit.relation_type === 'recommended' && '추천'}
                            {!['same_mobile_suit', 'same_series', 'variant', 'upgrade', 'recommended'].includes(relatedKit.relation_type) && relatedKit.relation_type}
                          </span>
                        )}
                      </div>
                      {/* 정보 */}
                      <div className="p-3">
                        {relatedKit.grade && (
                          <span className="text-xs text-primary font-semibold">
                            {relatedKit.grade.code}
                          </span>
                        )}
                        <p className="text-sm font-medium line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                          {relatedKit.name_ko}
                        </p>
                        {relatedKit.price_krw && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ₩{relatedKit.price_krw.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 파일럿 상세 모달 */}
      {showPilotModal && mobileSuit?.pilot && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowPilotModal(false)}
        >
          <div 
            className="bg-card border border-border rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="border-b border-border p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span>파일럿 정보</span>
              </h3>
              <button 
                onClick={() => setShowPilotModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            {/* 내용 - 커스텀 스크롤바 */}
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {/* 프로필 이미지 */}
              {mobileSuit.pilot.image_url && (
                <div className="flex justify-center">
                  <div className="w-32 h-40 rounded-xl overflow-hidden bg-secondary">
                    <img
                      src={mobileSuit.pilot.image_url}
                      alt={mobileSuit.pilot.name_ko}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* 이름 섹션 */}
              <div className="text-center pb-4 border-b border-border">
                <h4 className="text-2xl font-bold mb-1">
                  {mobileSuit.pilot.name_ko}
                </h4>
                {mobileSuit.pilot.name_en && (
                  <p className="text-muted-foreground">{mobileSuit.pilot.name_en}</p>
                )}
                {mobileSuit.pilot.name_ja && (
                  <p className="text-muted-foreground/60 text-sm">{mobileSuit.pilot.name_ja}</p>
                )}
                {mobileSuit.pilot.code && (
                  <span className="inline-block mt-2 px-2 py-1 bg-secondary text-muted-foreground rounded font-mono text-sm">
                    {mobileSuit.pilot.code}
                  </span>
                )}
              </div>

              {/* 기본 정보 */}
              <div className="space-y-3">
                {mobileSuit.pilot.role && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">역할</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      mobileSuit.pilot.role === 'protagonist' ? 'bg-blue-500/20 text-blue-400' :
                      mobileSuit.pilot.role === 'antagonist' ? 'bg-red-500/20 text-red-400' :
                      mobileSuit.pilot.role === 'supporting' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {mobileSuit.pilot.role === 'protagonist' ? '주인공' :
                       mobileSuit.pilot.role === 'antagonist' ? '적대자' :
                       mobileSuit.pilot.role === 'supporting' ? '조연' : '기타'}
                    </span>
                  </div>
                )}
                
                {mobileSuit.pilot.rank && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">계급</span>
                    <span className="text-foreground">{mobileSuit.pilot.rank}</span>
                  </div>
                )}

                {mobileSuit.pilot.nationality && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">국적</span>
                    <span className="text-foreground">{mobileSuit.pilot.nationality}</span>
                  </div>
                )}

                {mobileSuit.pilot.birth_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">생년월일</span>
                    <span className="text-foreground">{mobileSuit.pilot.birth_date}</span>
                  </div>
                )}

                {mobileSuit.pilot.death_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">사망일</span>
                    <span className="text-red-400">{mobileSuit.pilot.death_date}</span>
                  </div>
                )}

                {mobileSuit.pilot.blood_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">혈액형</span>
                    <span className="text-foreground">{mobileSuit.pilot.blood_type}형</span>
                  </div>
                )}

                {mobileSuit.pilot.height && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">신장</span>
                    <span className="text-foreground">{mobileSuit.pilot.height}cm</span>
                  </div>
                )}

                {mobileSuit.pilot.weight && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">체중</span>
                    <span className="text-foreground">{mobileSuit.pilot.weight}kg</span>
                  </div>
                )}
              </div>

              {/* 약력 */}
              {mobileSuit.pilot.bio && (
                <div className="pt-4 border-t border-border">
                  <h5 className="text-sm font-medium text-muted-foreground mb-2">약력</h5>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {mobileSuit.pilot.bio}
                  </p>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="border-t border-border p-4">
              <button
                onClick={() => setShowPilotModal(false)}
                className="w-full py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
