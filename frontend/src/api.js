import { auth } from './firebase'

// For deployment, set VITE_API_BASE (e.g. https://your-backend.onrender.com)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

async function authHeaders() {
  const user = auth.currentUser
  if (!user) throw new Error('Please log in first.')
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

async function errorMessage(res) {
  try {
    const data = await res.json()
    if (typeof data.detail === 'string') return data.detail
  } catch (e) {
    // ignore - fall through
  }
  return 'Something went wrong. Please try again.'
}

export async function askQuestion(query) {
  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(await errorMessage(res))
  const data = await res.json()
  return data.answer
}

export async function listDocuments() {
  const res = await fetch(`${API_BASE}/faculty/documents`, {
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error(await errorMessage(res))
  const data = await res.json()
  return data.documents
}

export async function uploadDocument(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/faculty/upload`, {
    method: 'POST',
    headers: await authHeaders(),
    body: form,
  })
  if (!res.ok) throw new Error(await errorMessage(res))
  return res.json()
}

export async function addTextNote(title, text) {
  const res = await fetch(`${API_BASE}/faculty/note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify({ title, text }),
  })
  if (!res.ok) throw new Error(await errorMessage(res))
  return res.json()
}

export async function deleteDocument(name) {
  const res = await fetch(`${API_BASE}/faculty/documents/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error(await errorMessage(res))
  return res.json()
}