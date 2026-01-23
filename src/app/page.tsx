// src/app/page.tsx
// 메인 페이지 - 건담 킷 목록

'use client'

import Link from 'next/link'
import { AuthButton } from '@/components/auth-button'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gradient">
              Gundam Database
            </h1>
            <nav className="flex items-center gap-4">
              <Link href="/kits" className="text-muted-foreground hover:text-foreground transition-colors">
                모델 탐색
              </Link>
              <AuthButton />
            </nav>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center space-y-6 animate-fade-in">
          <h2 className="text-5xl font-bold">
            반다이 건담 모델
            <br />
            <span className="text-gradient">모든 정보를 한곳에</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            HG, MG, RG, PG부터 SD까지
            <br />
            건담 모델의 모든 것을 탐색하고 공유하세요
          </p>
          <div className="flex gap-4 justify-center pt-8">
            <Link href="/kits" className="btn-primary text-lg px-8 py-3">
              모델 탐색하기
            </Link>
            <Link href="/about" className="btn-secondary text-lg px-8 py-3">
              자세히 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-threads text-center p-8">
            <div className="text-4xl font-bold text-gradient mb-2">1,000+</div>
            <div className="text-muted-foreground">건담 모델</div>
          </div>
          <div className="card-threads text-center p-8">
            <div className="text-4xl font-bold text-gradient mb-2">12</div>
            <div className="text-muted-foreground">등급 & 브랜드</div>
          </div>
          <div className="card-threads text-center p-8">
            <div className="text-4xl font-bold text-gradient mb-2">20+</div>
            <div className="text-muted-foreground">시리즈</div>
          </div>
        </div>
      </section>

      {/* 주요 기능 */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">주요 기능</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card-threads p-6 space-y-3">
            <div className="text-4xl">🔍</div>
            <h4 className="text-xl font-semibold">강력한 검색</h4>
            <p className="text-muted-foreground">
              등급, 시리즈, 가격대별로 원하는 모델을 빠르게 찾으세요
            </p>
          </div>
          <div className="card-threads p-6 space-y-3">
            <div className="text-4xl">🔗</div>
            <h4 className="text-xl font-semibold">구매 링크</h4>
            <p className="text-muted-foreground">
              반다이몰, 아마존 등 다양한 판매처 링크를 한번에
            </p>
          </div>
          <div className="card-threads p-6 space-y-3">
            <div className="text-4xl">🤝</div>
            <h4 className="text-xl font-semibold">집단지성</h4>
            <p className="text-muted-foreground">
              커뮤니티와 함께 정보를 업데이트하고 공유하세요
            </p>
          </div>
          <div className="card-threads p-6 space-y-3">
            <div className="text-4xl">📊</div>
            <h4 className="text-xl font-semibold">상세 정보</h4>
            <p className="text-muted-foreground">
              가격, 출시일, 스케일, 런너 수 등 모든 정보 제공
            </p>
          </div>
          <div className="card-threads p-6 space-y-3">
            <div className="text-4xl">🎨</div>
            <h4 className="text-xl font-semibold">고품질 이미지</h4>
            <p className="text-muted-foreground">
              박스아트, 완성품 사진, 런너 이미지까지
            </p>
          </div>
          <div className="card-threads p-6 space-y-3">
            <div className="text-4xl">🔔</div>
            <h4 className="text-xl font-semibold">신제품 알림</h4>
            <p className="text-muted-foreground">
              최신 출시작과 P-BANDAI 한정판 정보를 놓치지 마세요
            </p>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>© 2024 Gundam Database. Made with ❤️ for Gunpla fans.</p>
            <p className="text-sm mt-2">
              이 사이트는 비공식 팬 프로젝트입니다. 모든 건담 관련 저작권은 BANDAI NAMCO에 있습니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
