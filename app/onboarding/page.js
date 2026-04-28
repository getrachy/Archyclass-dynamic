'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function Onboarding() {
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        
        const { data } = await supabase
          .from('profiles')
          .select('class')
          .eq('id', user.id)
          .single()
        
        if (data?.class) {
          router.push('/dashboard')
        }
      }
    }
    getUser()
  }, [router, supabase])

  async function handleSave() {
    if (!selectedClass || !user) return
    
    setLoading(true)
    
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        class: selectedClass,
        updated_at: new Date().toISOString()
      })
    
    setLoading(false)
    
    if (error) {
      alert('Error saving class. Try again.')
      console.log(error)
    } else {
      router.push('/dashboard')
    }
  }

  if (!user) return <div style={{padding: '20px'}}>Loading...</div>

  return (
    <div style={{padding: '20px', maxWidth: '400px', margin: '0 auto'}}>
      <h1 style={{fontSize: '24px', marginBottom: '8px'}}>Welcome to Archyclass!</h1>
      <p style={{marginBottom: '24px', color: '#666'}}>Pick your class to get started</p>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        {['SS1', 'SS2', 'SS3'].map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            style={{
              padding: '16px',
              fontSize: '18px',
              border: selectedClass === cls ? '2px solid #0070f3' : '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: selectedClass === cls ? '#e6f4ff' : 'white',
              cursor: 'pointer'
            }}
          >
            {cls}
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={!selectedClass || loading}
        style={{
          width: '100%',
          marginTop: '24px',
          padding: '16px',
          fontSize: '16px',
          backgroundColor: selectedClass ? '#0070f3' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: selectedClass ? 'pointer' : 'not-allowed'
        }}
      >
        {loading ? 'Saving...' : 'Continue to Dashboard'}
      </button>
    </div>
  )
          }
