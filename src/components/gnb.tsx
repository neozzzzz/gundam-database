'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthButton } from './auth-button'

export function GNB() {
  const pathname = usePathname()

  // admin 페이지에서는 GNB 숨김
  if (pathname?.startsWith('/admin')) return null

  const navItems = [
    { href: '/', label: '홈' },
    { href: '/kits', label: '모델 목록' },
  ]

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href="/" className="text-2xl font-bold text-gradient hover:opacity-80 transition-opacity">
            GUNDAM ARCHIVE
          </Link>
          <nav className="flex items-center gap-4 whitespace-nowrap ml-auto">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={
                  pathname === href || (href !== '/' && pathname?.startsWith(href))
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground transition-colors'
                }
              >
                {label}
              </Link>
            ))}
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  )
}
