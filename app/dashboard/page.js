'use client'

import { useEffect, useState, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [userClass, setUserClass] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  // Create client once, not on every render
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), [])

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.replace('/login') // replace not push, so back button doesn't go to dashboard
        return
      }
      
      setUser(user)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('class')
        .eq('id', user.id)
        .single()
      
      if (error || !data?.class) {
        router.replace('/onboarding')
        return
      }
      
      setUserClass(data.class)
      setLoading(false)
    }
    getData()
  }, [router, supabase])

  const subjects = [
    { name: 'Technical Drawing', icon: '📐' },
    { name: 'Mathematics', icon: '🧮' },
    { name: 'Physics', icon: '⚛️' },
    { name: 'Chemistry', icon: '🧪' }
  ]

  const handleSelect = (subject) => {
    localStorage.setItem('selectedSubject', subject)
    router.push('/topics')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) return <div style={{padding: '20px', color: '#fff', background: '#000', minHeight: '100vh'}}>Loading...</div>

  return (
    <div style={{padding: '20px', maxWidth: '400px', margin: '0 auto', background: '#000', minHeight: '100vh'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h1 style={{fontSize: '24px', color: '#ff6b35'}}>Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: '#333',
            color: '#fff',
            border: '1px solid #ff6b35',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{
        padding: '20px',
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #ff6b35',
        marginBottom: '20px'
      }}>
        <p style={{color: '#999', fontSize: '14px', marginBottom: '8px'}}>Welcome back,</p>
        <p style={{color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '12px'}}>
          {user?.email}
        </p>
        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#ff6b35',
          color: '#fff',
          borderRadius: '6px',
          fontWeight: 'bold'
        }}>
          {userClass}
        </div>
      </div>

      <h2 style={{fontSize: '18px', color: '#fff', marginBottom: '12px'}}>
        {userClass} Subjects
      </h2>
      <p style={{color: '#999', marginBottom: '20px'}}>
        Choose a subject to view topics
      </p>

      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        {subjects.map((subject) => (
          <button
            key={subject.name}
            onClick={() => handleSelect(subject.name)}
            style={{
              padding: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#fff',
              border: '1px solid #ff6b35',
              borderRadius: '8px',
              backgroundColor: '#ff6b35',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{fontSize: '22px'}}>{subject.icon}</span>
            <span>{subject.name}</span>
            <span style={{fontSize: '22px'}}>→</span>
          </button>
        ))}
      </div>
    </div>
  )
    }
