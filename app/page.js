export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main style={{padding: '2rem', maxWidth: '800px', margin: '0 auto'}}>
      <div className="card">
        <h1>ArchyClass Dynamic</h1>
        <p style={{color: 'var(--text-muted)', margin: '1rem 0'}}>
          Technical Drawing notes for students and teachers
        </p>
        <button>Start Learning Free</button>
      </div>
    </main>
  )
}
