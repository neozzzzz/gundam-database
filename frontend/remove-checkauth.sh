#!/bin/bash

# checkAuth 제거 스크립트
# Phase 1: checkAuth 중복 제거

FILES=(
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/factions/new/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/kits/new/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/mobile-suit-pilots/new/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/mobile-suits/new/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/ms-organizations/new/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/org-faction-memberships/new/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/organizations/new/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/pilots/new/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/series/new/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/series/[id]/edit/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/organizations/[id]/edit/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/ms-organizations/[id]/edit/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/kits/[id]/edit/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/pilots/[id]/edit/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/mobile-suits/[id]/edit/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/factions/[id]/edit/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/org-faction-memberships/[id]/edit/page.tsx"
  "/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin/mobile-suit-pilots/[id]/edit/page.tsx"
)

echo "🔧 checkAuth 제거 스크립트 시작..."
echo ""

TOTAL_REMOVED_LINES=0
FILES_PROCESSED=0

for FILE in "${FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "⚠️  파일 없음: $FILE"
    continue
  fi
  
  # 백업 생성
  BACKUP="${FILE}.backup-checkauth-$(date +%Y%m%d-%H%M%S)"
  cp "$FILE" "$BACKUP"
  
  # 원본 라인 수
  BEFORE=$(wc -l < "$FILE")
  
  # 1. useRouter import 제거 (checkAuth에서만 사용하는 경우)
  # 2. checkAuth 함수 제거
  # 3. useEffect(() => { checkAuth() }, []) 제거
  
  # Node.js로 정확한 패턴 제거
  node -e "
    const fs = require('fs');
    let content = fs.readFileSync('$FILE', 'utf8');
    
    // 1. checkAuth 함수 제거 (여러 줄)
    content = content.replace(/const checkAuth = async \(\) => \{[^}]+router\.push\('\/admin\/login'\)[^}]*\}\s*/g, '');
    
    // 2. useEffect checkAuth 호출 제거
    content = content.replace(/useEffect\(\(\) => \{\s*checkAuth\(\)\s*\}, \[\]\)\s*/g, '');
    
    // 3. useRouter import 제거 (단, Link가 없으면 제거, 있으면 유지)
    const hasLink = content.includes(\"from 'next/link'\");
    if (!hasLink) {
      content = content.replace(/import \{ useRouter \} from 'next\/navigation'\s*/g, '');
    }
    
    fs.writeFileSync('$FILE', content, 'utf8');
  "
  
  # 수정 후 라인 수
  AFTER=$(wc -l < "$FILE")
  REMOVED=$((BEFORE - AFTER))
  TOTAL_REMOVED_LINES=$((TOTAL_REMOVED_LINES + REMOVED))
  FILES_PROCESSED=$((FILES_PROCESSED + 1))
  
  echo "✅ $(basename $(dirname $FILE))/$(basename $FILE): -${REMOVED}줄"
done

echo ""
echo "🎉 완료!"
echo "   처리된 파일: ${FILES_PROCESSED}개"
echo "   제거된 라인: ${TOTAL_REMOVED_LINES}줄"
