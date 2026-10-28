import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import '../auth.css'

function friendlyError(err) {
  if (err && err.message === 'NOT_FACULTY') {
    return 'This account is not a faculty account.'
  }
  switch (err && err.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a bit and try again.'
    case 'auth/network-request-failed':
      return 'Network problem. Check your internet connection.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase yet.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

function AuthPage() {
  const { signupStudent, loginStudent, loginFaculty } = useAuth()

  const [tab, setTab] = useState('student') // student | faculty
  const [mode, setMode] = useState('login') // login | signup
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isSignup = tab === 'student' && mode === 'signup'

  const switchTab = (t) => {
    setTab(t)
    setMode('login')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (isSignup && !name.trim()) {
      setError('Please enter your name.')
      return
    }

    setBusy(true)
    try {
      if (tab === 'faculty') {
        await loginFaculty(email.trim(), password)
      } else if (mode === 'signup') {
        await signupStudent(name.trim(), email.trim(), password)
      } else {
        await loginStudent(email.trim(), password)
      }
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>
        {tab === 'faculty' ? 'Faculty login' : isSignup ? 'Create your account' : 'Welcome back'}
      </h2>
      <p style={{ fontSize: '15px', marginBottom: '28px' }}>
        {tab === 'faculty'
          ? 'Share notices and upload documents for students.'
          : 'Log in to ask questions and keep your chat history.'}
      </p>

      <div className="auth-card">
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${tab === 'student' ? 'active' : ''}`}
            onClick={() => switchTab('student')}
          >
            Student
          </button>
          <button
            type="button"
            className={`auth-tab ${tab === 'faculty' ? 'active' : ''}`}
            onClick={() => switchTab('faculty')}
          >
            Faculty
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <label className="auth-field">
              <span>Full name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={6}
              required
            />
          </label>

          {tab === 'faculty' && (
            <p className="auth-note">
              Faculty accounts are created by the administrator. Students cannot sign up here.
            </p>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button className="btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>

        {tab === 'student' && (
          <p className="auth-switch">
            {mode === 'login' ? (
              <>
                New here?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError('') }}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => { setMode('login'); setError('') }}>
                  Log in
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

export default AuthPage
