import { useState, useEffect } from 'react'
import { BrandProvider } from './context/BrandContext'
import Login from './components/Login'
import Layout from './components/Layout'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for session in localStorage
    const storedSession = localStorage.getItem('session')
    if (storedSession) {
      try {
        setSession(JSON.parse(storedSession))
      } catch (e) {
        localStorage.removeItem('session')
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen">
      {!session ? (
        <Login />
      ) : (
        <BrandProvider>
          <Layout session={session} />
        </BrandProvider>
      )}
    </div>
  )
}

export default App
