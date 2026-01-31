import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()

  // 이미 관리자로 로그인되어 있으면 admin 대시보드로 리다이렉트
  if (session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    redirect('/admin')
  }

  return <>{children}</>
}
