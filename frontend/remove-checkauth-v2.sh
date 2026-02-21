#!/bin/bash

# checkAuth 제거 스크립트 v2
# 더 정교한 패턴 매칭

echo "🔧 checkAuth 제거 스크립트 v2 시작..."
echo ""

# Edit 페이지 목록
EDIT_FILES=(
  "series/[id]/edit/page.tsx"
  "organizations/[id]/edit/page.tsx"
  "ms-organizations/[id]/edit/page.tsx"
  "kits/[id]/edit/page.tsx"
  "pilots/[id]/edit/page.tsx"
  "mobile-suits/[id]/edit/page.tsx"
  "factions/[id]/edit/page.tsx"
  "org-faction-memberships/[id]/edit/page.tsx"
  "mobile-suit-pilots/[id]/edit/page.tsx"
)

BASE_DIR="/Users/cheetar/work/gundam-db-project-mac/frontend/src/app/admin"
TOTAL_REMOVED=0

for FILE_PATH in "${EDIT_FILES[@]}"; do
  FILE="$BASE_DIR/$FILE_PATH"
  
  if [ ! -f "$FILE" ]; then
    echo "⚠️  파일 없음: $FILE_PATH"
    continue
  fi
  
  # 백업
  BACKUP="${FILE}.backup-v2-$(date +%Y%m%d-%H%M%S)"
  cp "$FILE" "$BACKUP"
  
  BEFORE=$(wc -l < "$FILE")
  
  # Python으로 정교한 제거
  python3 << 'PYTHON_SCRIPT'
import re
import sys

file_path = sys.argv[1]

with open(file_path, 'r') as f:
    content = f.read()

# 1. checkAuth 함수 제거 (멀티라인)
content = re.sub(
    r'\n\s*const checkAuth = async \(\) => \{[^}]*router\.push\([^)]*\)[^}]*\}\s*\n',
    '\n',
    content,
    flags=re.MULTILINE | re.DOTALL
)

# 2. await checkAuth() 호출 제거
content = re.sub(r'\s*await checkAuth\(\)\s*\n', '', content)

# 3. 빈 줄 정리
content = re.sub(r'\n\n\n+', '\n\n', content)

with open(file_path, 'w') as f:
    f.write(content)
PYTHON_SCRIPT "$FILE"
  
  AFTER=$(wc -l < "$FILE")
  REMOVED=$((BEFORE - AFTER))
  TOTAL_REMOVED=$((TOTAL_REMOVED + REMOVED))
  
  echo "✅ $FILE_PATH: -${REMOVED}줄"
done

echo ""
echo "🎉 Edit 페이지 완료! 총 -${TOTAL_REMOVED}줄"
