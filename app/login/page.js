'use client'

import { createClient } from '@/lib/supabase'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('login')
  const [message, setMessage] = useState('')
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('class')
          .eq('id', user.id)
          .maybeSingle()
        if (profile?.class) {
          router.push('/dashboard') // Changed from replace
        } else {
          router.push('/onboarding') // Changed from replace
        }
      }
    }
    checkUser()
  }, [router, supabase])

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      if (view === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.refresh()
        const { data: profile } = await supabase
          .from('profiles')
          .select('class')
          .eq('id', data.user.id)
          .maybeSingle()
        if (profile?.class) {
          router.push('/dashboard') // Changed from replace
        } else {
          router.push('/onboarding') // Changed from replace
        }
      } else if (view === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/onboarding` }
        })
        if (error) throw error
        setMessage('Check your email for confirmation link')
      } else if (view === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`
        })
        if (error) throw error
        setMessage('Password reset link sent to your email')
      }
    } catch (error) {
      setMessage(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    margin: '8px 0',
    background: '#1a1a1a',
    border: '1px solid #ff6b35',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '400px', margin: '2rem auto' }}>
      <div className="card">
        <h1 style={{ marginBottom: '1.5rem' }}>
          {view === 'login' && 'Login'}
          {view === 'signup' && 'Create Account'}
          {view === 'forgot' && 'Reset Password'}
        </h1>
        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          {view !== 'forgot' && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
              minLength={6}
            />
          )}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Loading...' : view === 'login' ? 'Sign In' : view === 'signup' ? 'Sign Up' : 'Send Reset Link'}
          </button>
        </form>
        {message && (
          <p style={{
            marginTop: '1rem',
            padding: '12px',
            background: message.includes('sent') || message.includes('Check') ? 'green' : '#f44336',
            borderRadius: '8px',
            fontSize: '14px',
          }}>
            {message}
          </p>
        )}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#999' }}>
          {view === 'login' && (
            <>
              <p onClick={() => setView('forgot')} style={{ cursor: 'pointer', marginBottom: '8px' }}>
                Forgot password?
              </p>
              <p onClick={() => setView('signup')} style={{ cursor: 'pointer' }}>
                No account? <span style={{ color: '#ff6b35' }}>Sign up</span>
              </p>
            </>
          )}
          {view === 'signup' && (
            <p onClick={() => setView('login')} style={{ cursor: 'pointer' }}>
              Have account? <span style={{ color: '#ff6b35' }}>Login</span>
            </p>
          )}
          {view === 'forgot' && (
            <p onClick={() => setView('login')} style={{ cursor: 'pointer' }}>
              Back to <span style={{ color: '#ff6b35' }}>Login</span>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}