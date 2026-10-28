import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Nav, Hero, Coverage, HowItWorks } from './components/Landing'
import AuthPage from './components/AuthPage'
import { StudentDashboard, FacultyDashboard } from './components/Dashboards'

function AppInner() {
  const { user, profile, loading, logout } = useAuth()
  const [page, setPage] = useState('home') // home | auth

  if (loading) {
    return (
      <div style={{ padding: '80px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: '15px' }}>Loading...</p>
      </div>
    )
  }

  const goHome = () => setPage('home')
  const goLogin = () => setPage('auth')
  const handleLogout = async () => {
    await logout()
    setPage('home')
  }

  let body
  if (user) {
    body = profile && profile.role === 'faculty'
      ? <FacultyDashboard profile={profile} uid={user.uid} />
      : <StudentDashboard profile={profile} uid={user.uid} />
  } else if (page === 'auth') {
    body = <AuthPage />
  } else {
    body = (
      <>
        <Hero onStart={goLogin} />
        <hr className="hairline" />
        <Coverage />
        <HowItWorks />
        <section className="wrap" style={{ padding: '88px 32px 120px', maxWidth: '720px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Ready to ask?</h2>
          <p style={{ fontSize: '15px', marginBottom: '28px' }}>
            Create a free student account to ask questions and keep your chat history.
          </p>
          <button className="btn-primary" onClick={goLogin}>Login or create account</button>
        </section>
      </>
    )
  }

  return (
    <div>
      <Nav
        user={user}
        profile={profile}
        showLinks={page === 'home'}
        onLogin={goLogin}
        onLogout={handleLogout}
        onHome={goHome}
      />
      {body}
      <footer style={{ borderTop: '1px solid var(--line)', padding: '32px' }}>
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--slate)' }}>
          <span>Campus Assistant - SIH, Smart Education</span>
          <span>Built with LangChain, FAISS, Gemini and Firebase</span>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}

export default App