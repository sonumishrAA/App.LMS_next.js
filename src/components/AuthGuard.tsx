'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Cookies from 'js-cookie'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const publicRoutes = ['/login', '/forgot-password', '/reset-password']
      const isPublicRoute = publicRoutes.some(r => pathname.startsWith(r))

      if (!user) {
        if (!isPublicRoute) {
          router.push('/login')
        }
        setLoading(false)
        return
      }

      // Logged in
      const { data: staff } = await supabase
        .from('staff')
        .select('role, library_ids')
        .eq('user_id', user.id)
        .single()

      const bypassAll = ['/renew', '/blocked', '/change-password', '/select-library', '/api']
      const isBypass = bypassAll.some(r => pathname.startsWith(r))

      if (!isBypass && !isPublicRoute) {
        const libraryIds: string[] = staff?.library_ids || []

        if (libraryIds.length > 1 && !Cookies.get('active_library_id')) {
          router.push('/select-library')
          return
        }

        const selectedLibId = Cookies.get('active_library_id') || libraryIds[0]

        if (selectedLibId) {
          const { data: library } = await supabase
            .from('libraries')
            .select('subscription_end, subscription_status, name')
            .eq('id', selectedLibId)
            .single()

          if (library) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const subEnd = new Date(library.subscription_end)
            subEnd.setHours(0, 0, 0, 0)

            if (today > subEnd) {
              if (staff?.role === 'owner') {
                router.push(`/renew?library_id=${selectedLibId}`)
                return
              } else {
                router.push('/blocked')
                return
              }
            }
          }
        }
      }

      if (isPublicRoute) {
        router.push('/')
        return
      }

      setLoading(false)
    }

    checkAuth()
  }, [user, pathname, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  return <>{children}</>
}
