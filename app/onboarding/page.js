'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function Onboarding() {
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  
  // Create client once, not on every render
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), [])

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login') // Changed: push → replace
      } else {
        setUser(user)
        
        const { data } = await supabase
          .from('profiles')
          .select('class')
          .eq('id', user.id)
          .single()
        
        if (data?.class) {
          router.replace('/dashboard') // Changed: push → replace
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
      router.replace('/dashboard') // Changed: push → replace
    }
  }

  if (!user) return <div style={{padding: '20px', color: '#fff'}}>Loading...</div>

  const classes = [
    { name: 'SS1', left: '📚', right: '✨' },
    { name: 'SS2', left: '📝', right: '🚀' },
    { name: 'SS3', left: '🎓', right: '💡' }
  ]

  return (
    <div style={{padding: '20px', maxWidth: '400px', margin: '0 auto', background: '#000', minHeight: '100vh'}}>
      <h1 style={{fontSize: '24px', marginBottom: '8px', color: '#ff6b35'}}>Welcome to Archyclass!</h1>
      <p style={{marginBottom: '24px', color: '#999'}}>Pick your class to get started</p>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        {classes.map((cls) => (
          <button
            key={cls.name}
            onClick={() => setSelectedClass(cls.name)}
            style={{
              padding: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#fff',
              border: selectedClass === cls.name ? '3px solid #fff' : '1px solid #ff6b35',
              borderRadius: '8px',
              backgroundColor: '#ff6b35',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: selectedClass === cls.name ? 1 : 0.85
            }}
          >
            <span style={{fontSize: '22px'}}>{cls.left}</span>
            <span>{cls.name}</span>
            <span style={{fontSize: '22px'}}>{cls.right}</span>
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
          fontWeight: 'bold',
          backgroundColor: selectedClass ? '#ff6b35' : '#333',
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
