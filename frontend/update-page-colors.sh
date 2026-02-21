#!/bin/bash

# 색상 시스템 일괄 적용 스크립트
# AdminSearchFilter에 focusColor 추가

echo "🎨 색상 시스템 일괄 적용 시작..."
echo ""

PAGES=(
  "factions"
  "kits"
  "mobile-suits"
  "pilots"
  "series"
  "organizations"
  "ms-organizations"
  "org-faction-memberships"
  "mobile-suit-pilots"
)

TOTAL_UPDATED=0

for PAGE in "${PAGES[@]}"; do
  FILE="src/app/admin/$PAGE/page.tsx"
  
  if [ ! -f "$FILE" ]; then
    echo "⚠️  파일 없음: $PAGE"
    continue
  fi
  
  # 백업
  BACKUP="${FILE}.backup-colors-$(date +%Y%m%d-%H%M%S)"
  cp "$FILE" "$BACKUP"
  
  # AdminSearchFilter에 focusColor 추가
  # 패턴: placeholder={...} 뒤에 추가
  # 이미 focusColor가 있으면 스킵
  
  if grep -q "focusColor=" "$FILE"; then
    echo "✅ $PAGE: 이미 focusColor 설정됨"
    rm "$BACKUP"
    continue
  fi
  
  # sed로 placeholder 다음 줄에 focusColor 추가
  sed -i '' '/placeholder={PAGE_CONFIG\.searchPlaceholder}/a\
              focusColor={PAGE_CONFIG.color.primary}
' "$FILE" 2>/dev/null
  
  # 실패 시 다른 패턴 시도
  if [ $? -ne 0 ]; then
    # Python으로 정교한 처리
    python3 << 'PYTHON_SCRIPT' "$FILE"
import re
import sys

file_path = sys.argv[1]

with open(file_path, 'r') as f:
    content = f.read()

# AdminSearchFilter 패턴 찾기 (여러 줄)
pattern = r'(<AdminSearchFilter\s+[^>]*placeholder=\{[^}]+\}\s*)'

def add_focus_color(match):
    text = match.group(1)
    # 이미 focusColor가 있으면 그대로 반환
    if 'focusColor' in text:
        return text
    # 마지막 prop 뒤에 focusColor 추가
    return text.rstrip() + '\n              focusColor={PAGE_CONFIG.color.primary}\n            '

content = re.sub(pattern, add_focus_color, content, flags=re.MULTILINE)

with open(file_path, 'w') as f:
    f.write(content)
PYTHON_SCRIPT
  fi
  
  TOTAL_UPDATED=$((TOTAL_UPDATED + 1))
  echo "✅ $PAGE: focusColor 추가됨"
done

echo ""
echo "🎉 완료! 총 ${TOTAL_UPDATED}개 페이지 업데이트"
