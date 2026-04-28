'use client'
import { createClient } from '@/lib/supabase'
import { login } from './actions'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'

function SubmitButton({ view, loading }) {
  const { pending } = useFormStatus()
  const isLoading = pending || loading
  
  return (
    <button 
      type="submit" 
      disabled={isLoading}
      style={{width: '100%', marginTop: '1rem', opacity: isLoading ? 0.7 : 1}}
    >
      {isLoading ? 'Loading...' : 
       view === 'login' ? 'Sign In' :
       view === 'signup' ? 'Sign Up' : 'Send Reset Link'}
    </button>
  )
}

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('login') // login | signup | forgot
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  // Checks if user is already logged in
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('class')
          .eq('id', session.user.id)
          .single()
        
        if (profile?.class) {
          router.replace('/dashboard')
        } else {
          router.replace('/onboarding')
        }
      }
    }
    checkUser()
  }, [router, supabase])

  // For signup and forgot - these stay client side
  const handleClientAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (view === 'signup') {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { 
            emailRedirectTo: `${window.location.origin}/onboarding`
          }
        })
        if (error) throw error
        setMessage('Check your email for confirmation link')
      }

      if (view === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`
        })
        if (error) throw error
        setMessage('Password reset link sent to your email')
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', 
    padding: '12px', 
    margin: '8px 0',
    background: 'var(--bg)', 
    border: '1px solid var(--border)',
