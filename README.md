# Gundam Database - 건담 모델 데이터베이스

반다이 건담 모델의 모든 정보를 한곳에 모은 커뮤니티 기반 데이터베이스 서비스입니다.

## ✨ 주요 기능

- 🔍 **강력한 검색**: 등급, 시리즈, 가격대별 필터링
- 📦 **상세 정보**: 가격, 출시일, 스케일, 런너 수 등
- 🔗 **구매 링크**: 반다이몰, 아마존 등 다양한 판매처
- 🤝 **집단지성**: 사용자 제안으로 정보 업데이트
- 🎨 **Threads 스타일 UI**: 깔끔한 다크모드 디자인
- 🔐 **Google OAuth**: 간편한 소셜 로그인

## 🛠️ 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (Threads 스타일)
- **Framer Motion** (애니메이션)

### Backend
- **Supabase** (PostgreSQL 데이터베이스)
- **Next.js API Routes**
- **Google OAuth**

### 데이터 수집
- **Python** (크롤링)
- **BeautifulSoup4**
- **Requests**

## 📁 프로젝트 구조

```
gundam-database/
├── database/                   # 데이터베이스 SQL 스크립트
│   ├── 01-create-tables.sql
│   ├── 02-insert-master-data.sql
│   ├── 03-insert-sample-kits.sql
│   └── SUPABASE-SETUP-GUIDE.md
├── crawling/                   # 크롤링 스크립트
│   ├── main.py
│   ├── config.py
│   └── crawlers/
└── frontend/                   # Next.js 앱
    ├── src/
    │   ├── app/               # 페이지 & API Routes
    │   ├── components/        # React 컴포넌트
    │   └── lib/               # 유틸리티 & 타입
    ├── package.json
    └── tsconfig.json
```

## 🚀 시작하기

### 1. 사전 준비
- Node.js 18+ 설치
- Python 3.8+ 설치 (크롤링용)
- Supabase 계정

### 2. Supabase 설정
1. [database/SUPABASE-SETUP-GUIDE.md](database/SUPABASE-SETUP-GUIDE.md) 가이드 따라 진행
2. SQL 파일 순서대로 실행
3. API 키 복사

### 3. Next.js 설치
```bash
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 Supabase 키 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 4. 크롤링 (선택사항)
```bash
cd crawling

# Python 의존성 설치
pip install -r requirements.txt

# 샘플 데이터 생성
python generate_sample_data.py

# 크롤링 실행
python main.py
```

## 📖 API 문서

### 건담 킷 API

#### 목록 조회
```
GET /api/kits
Query Parameters:
  - grade: 등급 코드 (HG, MG, RG 등)
  - brand: 브랜드 코드 (HGUC, MGEX 등)
  - series: 시리즈 ID
  - search: 검색어
  - sortBy: 정렬 기준 (release_date, price_krw 등)
  - page: 페이지 번호
  - limit: 페이지당 개수
```

#### 상세 조회
```
GET /api/kits/[id]
```

#### 관련 킷 조회
```
GET /api/kits/[id]/related
```

### 필터 옵션 API
```
GET /api/filters
Response: 등급, 브랜드, 시리즈, 타임라인 목록
```

### 제안 API

#### 제안 목록 조회
```
GET /api/suggestions
Query Parameters:
  - status: pending, approved, rejected
```

#### 제안 생성
```
POST /api/suggestions
Body: {
  kit_id?: string
  suggestion_type: 'edit' | 'new' | 'delete'
  suggested_data: object
  reason?: string
}
```

#### 제안 승인/거부 (관리자)
```
POST /api/suggestions/[id]/review
Body: {
  status: 'approved' | 'rejected'
  review_comment?: string
}
```

## 🎨 UI 가이드

Threads 스타일 컴포넌트 클래스:
- `card-threads`: 카드 레이아웃
- `btn-threads`: 기본 버튼
- `btn-primary`: 주요 액션 버튼
- `btn-secondary`: 보조 버튼
- `input-threads`: 입력 필드

## 📊 데이터베이스 스키마

13개 테이블:
- `gundam_kits`: 메인 킷 정보
- `grades`: 등급 (HG, MG, RG, PG, SD)
- `brands`: 브랜드 (HGUC, MGEX 등)
- `series`: 작품 시리즈
- `timelines`: 세계관 (UC, CE, AD 등)
- `mobile_suits`: 모빌슈트/기체
- `kit_images`: 킷 이미지
- `kit_relations`: 킷 간 관계
- `purchase_links`: 구매 링크
- `stores`: 판매처
- `users`: 사용자
- `suggestions`: 사용자 제안
- `user_activities`: 사용자 활동

## 🔒 보안

- Row Level Security (RLS) 적용
- Google OAuth 인증
- 관리자/사용자 권한 분리
- API Rate Limiting

## 📝 라이선스

이 프로젝트는 비공식 팬 프로젝트입니다.
모든 건담 관련 저작권은 BANDAI NAMCO에 있습니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

## 📧 문의

프로젝트 관련 문의사항이 있으시면 Issue를 등록해주세요.

---

Made with ❤️ for Gunpla fans
