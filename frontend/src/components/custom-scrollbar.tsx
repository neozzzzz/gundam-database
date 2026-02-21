// src/components/custom-scrollbar.tsx
// 커스텀 스크롤바가 적용된 스크롤 컨테이너 컴포넌트
// 모듈화하여 재사용 가능

'use client'

import { ReactNode } from 'react'

interface CustomScrollbarProps {
  children: ReactNode
  maxHeight?: string      // 최대 높이 (기본: 300px)
  className?: string      // 추가 클래스
}

export function CustomScrollbar({ 
  children, 
  maxHeight = '300px',
  className = ''
}: CustomScrollbarProps) {
  return (
    <div 
      className={`custom-scrollbar overflow-y-auto ${className}`}
      style={{ maxHeight }}
    >
      {children}
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  )
}
