'use server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  
  if (error) {
    return { error: error.message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('class')
    .eq('id', data.user.id)
    .single()
  
  if (profile?.class) {
    redirect('/dashboard')
  } else {
    redirect('/onboarding')
  }
                           }
