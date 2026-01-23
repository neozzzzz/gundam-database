# Next.js 프로젝트 설치 가이드 (윈도우)

## 📋 사전 준비

### 1. Node.js 설치 확인
```bash
node --version
npm --version
```

**설치되지 않았다면:**
1. [https://nodejs.org](https://nodejs.org) 접속
2. **LTS 버전** (왼쪽) 다운로드
3. 설치 후 컴퓨터 재시작
4. 위 명령어로 다시 확인

---

## 🚀 Next.js 프로젝트 생성

### Step 1: 프로젝트 폴더 생성
```bash
# 원하는 위치로 이동 (예: 바탕화면)
cd Desktop

# 프로젝트 생성
npx create-next-app@latest gundam-database
```

### Step 2: 설치 중 질문에 답변
```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … Yes
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias (@/*)? … No
```

### Step 3: 프로젝트 폴더로 이동
```bash
cd gundam-database
```

---

## 📦 필요한 패키지 설치

```bash
# Supabase 클라이언트
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# UI 라이브러리 (선택사항, Threads 스타일용)
npm install framer-motion clsx

# 유틸리티
npm install date-fns
```

---

## 🔧 환경 변수 설정

### `.env.local` 파일 생성
프로젝트 루트 폴더에 `.env.local` 파일 생성 후 아래 내용 입력:

```env
# Supabase 설정 (나중에 실제 값으로 교체)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth (나중에 설정)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📁 프로젝트 구조

```
gundam-database/
├── src/
│   ├── app/                    # App Router
│   │   ├── api/               # API Routes
│   │   │   ├── kits/          # 건담 킷 API
│   │   │   ├── auth/          # 인증 API
│   │   │   └── suggestions/   # 제안 API
│   │   ├── (auth)/            # 인증 관련 페이지
│   │   │   └── login/
│   │   ├── kits/              # 킷 목록/상세
│   │   ├── admin/             # 관리자 페이지
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   └── page.tsx           # 메인 페이지
│   ├── components/            # React 컴포넌트
│   │   ├── kit-card.tsx
│   │   ├── kit-detail.tsx
│   │   └── navigation.tsx
│   ├── lib/                   # 유틸리티
│   │   ├── supabase/          # Supabase 클라이언트
│   │   ├── types/             # TypeScript 타입
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── public/                     # 정적 파일
├── .env.local                  # 환경 변수 (git에 포함 X)
├── package.json
└── tsconfig.json
```

---

## ✅ 설치 확인

```bash
# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속하여 기본 Next.js 페이지 확인

---

## 🔄 다음 단계

1. Supabase 클라이언트 설정
2. API Routes 개발
3. 컴포넌트 개발
4. Threads 스타일 UI 적용

---

## 💡 유용한 명령어

```bash
# 개발 서버 실행
npm run dev

# 빌드 (배포 전)
npm run build

# 프로덕션 모드 실행
npm run start

# 린트 검사
npm run lint
```
