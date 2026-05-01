'use client'

import { useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function Home() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }
    check()
  }, [router, supabase])

  return (
    <main style={{padding: '2rem', maxWidth: '800px', margin: '0 auto'}}>
      <div className="card">
        <h1>ArchyClass Dynamic</h1>
        <p style={{color: 'var(--text-muted)', margin: '1rem 0'}}>
          Technical Drawing notes for students and teachers
        </p>
        <button onClick={() => window.location.href = '/login'}>
          Start Learning Free
        </button>
      </div>
    </main>
  )
}