'use client'

import Script from 'next/script'

// ============================================
// Google Analytics 컴포넌트
// 사용법: layout.tsx에서 <GoogleAnalytics /> 추가
// ============================================

const GA_TRACKING_ID = 'G-JYBGGG47JQ'

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}');
        `}
      </Script>
    </>
  )
}
