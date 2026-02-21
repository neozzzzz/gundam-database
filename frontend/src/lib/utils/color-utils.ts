// src/lib/utils/color-utils.ts
// 동적 색상 생성 유틸리티

/**
 * Hex 색상 코드에서 Tailwind 클래스 생성
 * 페이지별 primary 색상을 동적으로 적용하기 위함
 */

export interface ColorConfig {
  primary: string       // Hex 코드 (예: '#3B82F6')
  text?: string         // 기본 텍스트 색상
  textHover?: string    // Hover 텍스트 색상
  bgSolid?: string      // 배경 색상 (버튼 등)
  badge?: string        // 배지 배경 색상
}

/**
 * Hex 색상을 밝기 조절 (hover 효과용)
 */
function adjustBrightness(hex: string, percent: number): string {
  // #RRGGBB 형식 검증
  const match = hex.match(/^#([0-9a-f]{6})$/i)
  if (!match) return hex
  
  const num = parseInt(match[1], 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + percent))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent))
  
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/**
 * 동적 버튼 스타일 생성
 */
export function getButtonStyles(color: ColorConfig, variant: 'primary' | 'secondary' | 'danger' = 'primary') {
  const bgColor = color.bgSolid || color.primary
  const hoverColor = adjustBrightness(bgColor, -20) // 약간 어둡게
  
  if (variant === 'danger') {
    return {
      base: 'bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm',
      style: {},
    }
  }
  
  if (variant === 'secondary') {
    return {
      base: 'bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors',
      style: {},
    }
  }
  
  return {
    base: 'text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 hover:shadow-lg',
    style: {
      backgroundColor: bgColor,
    },
    hover: hoverColor,
  }
}

/**
 * 동적 뱃지 스타일 생성
 */
export function getBadgeStyles(color: ColorConfig) {
  const bgColor = color.badge || color.primary
  
  // Hex를 RGB로 변환 후 투명도 적용
  const match = bgColor.match(/^#([0-9a-f]{6})$/i)
  if (match) {
    const num = parseInt(match[1], 16)
    const r = num >> 16
    const g = (num >> 8) & 0x00FF
    const b = num & 0x0000FF
    
    return {
      base: 'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
      style: {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
        color: bgColor,
      },
    }
  }
  
  return {
    base: 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800',
    style: {},
  }
}

/**
 * 동적 링크/텍스트 스타일 생성
 */
export function getTextStyles(color: ColorConfig) {
  const textColor = color.text || color.primary
  const hoverColor = adjustBrightness(textColor, -20)
  
  return {
    base: 'transition-colors',
    style: {
      color: textColor,
    },
    hover: hoverColor,
  }
}

/**
 * Focus ring 색상 생성
 */
export function getFocusRingColor(color: ColorConfig): string {
  return color.primary
}

/**
 * Hex 색상에서 RGBA 생성
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const match = hex.match(/^#([0-9a-f]{6})$/i)
  if (!match) return `rgba(0, 0, 0, ${alpha})`
  
  const num = parseInt(match[1], 16)
  const r = num >> 16
  const g = (num >> 8) & 0x00FF
  const b = num & 0x0000FF
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * 페이지 컬러 설정에서 완전한 ColorConfig 생성
 */
export function normalizeColorConfig(pageColor: any): ColorConfig {
  return {
    primary: pageColor.primary || pageColor.bgSolid || '#3B82F6',
    text: pageColor.text,
    textHover: pageColor.textHover,
    bgSolid: pageColor.bgSolid || pageColor.primary || '#3B82F6',
    badge: pageColor.badge,
  }
}
