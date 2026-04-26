'use client'
import { createClient } from '@/lib/supabase'
import { useState } from 'react'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password })
    
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Password updated! Redirecting to login...')
      setTimeout(() => window.location.href = '/login', 2000)
    }
    setLoading(false)
  }

  return (
    <main style={{padding: '2rem', maxWidth: '400px', margin: '2rem auto'}}>
      <div className="card">
        <h1>Set New Password</h1>
        <form onSubmit={handleUpdate}>
          <input 
            type="password" 
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '12px', margin: '1rem 0',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text)'
            }}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading} style={{width: '100%'}}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        {message && <p style={{marginTop: '1rem', color: 'var(--primary)'}}>{message}</p>}
      </div>
    </main>
  )
      }
