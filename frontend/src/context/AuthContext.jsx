import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null) // { name, role }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      let p = { name: u.displayName || u.email, role: 'student' }
      try {
        const snap = await getDoc(doc(db, 'users', u.uid))
        if (snap.exists()) {
          const d = snap.data()
          p = { name: d.name || p.name, role: d.role || 'student' }
        }
      } catch (err) {
        console.error('Could not load profile', err)
      }

      setUser(u)
      setProfile(p)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signupStudent = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    await setDoc(doc(db, 'users', cred.user.uid), {
      name,
      email,
      role: 'student',
      createdAt: serverTimestamp(),
    })
    setProfile({ name, role: 'student' })
  }

  const loginStudent = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const loginFaculty = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    if (!snap.exists() || snap.data().role !== 'faculty') {
      await signOut(auth)
      throw new Error('NOT_FACULTY')
    }
  }

  const logout = () => signOut(auth)

  const value = { user, profile, loading, signupStudent, loginStudent, loginFaculty, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
