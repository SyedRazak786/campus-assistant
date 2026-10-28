
import { auth } from './firebase'

// Leave VITE_API_BASE unset for a single-service deployment.
// The frontend will call the API on the same domain.
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '')

async function authHeaders() {
  const user = auth.currentUser

  if (!user) {
    throw new Error('Please log in first.')
  }

  const token = await user.getIdToken()

  return {
    Authorization: `Bearer ${token}`,
  }
}

async function errorMessage(res) {
  try {
    const data = await res.json()

    if (typeof data.detail === 'string') {
      return data.detail
    }

    if (typeof data.message === 'string') {
      return data.message
    }
  } catch {
    // The response may not contain JSON.
  }

  return `Request failed (${res.status}). Please try again.`
}

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options)

  if (!res.ok) {
    throw new Error(await errorMessage(res))
  }

  return res.json()
}

export async function askQuestion(query) {
  const headers = await authHeaders()

  const data = await apiRequest('/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query }),
  })

  return data.answer
}

export async function listDocuments() {
  const headers = await authHeaders()

  const data = await apiRequest('/faculty/documents', {
    headers,
  })

  return data.documents
}

export async function uploadDocument(file) {
  const headers = await authHeaders()
  const form = new FormData()

  form.append('file', file)

  return apiRequest('/faculty/upload', {
    method: 'POST',
    headers,
    body: form,
  })
}

export async function addTextNote(title, text) {
  const headers = await authHeaders()

  return apiRequest('/faculty/note', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ title, text }),
  })
}

export async function deleteDocument(name) {
  const headers = await authHeaders()

  return apiRequest(
    `/faculty/documents/${encodeURIComponent(name)}`,
    {
      method: 'DELETE',
      headers,
    },
  )
}
