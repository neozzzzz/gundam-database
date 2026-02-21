-- gundam_kits 테이블 타임스탬프 자동화
-- Supabase SQL Editor에서 실행

-- 1. created_at 기본값 설정
ALTER TABLE gundam_kits 
  ALTER COLUMN created_at SET DEFAULT now();

-- 2. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 트리거 있으면 제거 후 재생성
DROP TRIGGER IF EXISTS set_updated_at ON gundam_kits;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON gundam_kits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 확인
SELECT 'Done! gundam_kits 타임스탬프 자동화 완료' AS result;
