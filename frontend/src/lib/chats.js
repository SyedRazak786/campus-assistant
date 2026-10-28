import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// One chat = users/{uid}/chats/{chatId}
// Messages live in a subcollection: users/{uid}/chats/{chatId}/messages/{messageId}

export function chatsCollection(uid) {
  return collection(db, 'users', uid, 'chats')
}

export function messagesCollection(uid, chatId) {
  return collection(db, 'users', uid, 'chats', chatId, 'messages')
}

/** Live-subscribe to a student's chat list, newest first. */
export function listenToChats(uid, callback) {
  const q = query(chatsCollection(uid), orderBy('updatedAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(chats)
  })
}

/** Live-subscribe to one chat's messages, oldest first. */
export function listenToMessages(uid, chatId, callback) {
  const q = query(messagesCollection(uid, chatId), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(messages)
  })
}

/** Create a new empty chat and return its id. */
export async function createChat(uid) {
  const ref = await addDoc(chatsCollection(uid), {
    title: 'New chat',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** Add a message to a chat and bump the chat's updatedAt / title. */
export async function addMessage(uid, chatId, role, text) {
  await addDoc(messagesCollection(uid, chatId), {
    role,
    text,
    createdAt: serverTimestamp(),
  })

  const chatRef = doc(db, 'users', uid, 'chats', chatId)
  const update = { updatedAt: serverTimestamp() }

  if (role === 'user') {
    // Only set the title from the first user message (caller checks if it's the first)
    update.lastUserMessage = text
  }

  await setDoc(chatRef, update, { merge: true })
}

/** Set a chat's title (used once, from the first question asked). */
export async function setChatTitle(uid, chatId, title) {
  const chatRef = doc(db, 'users', uid, 'chats', chatId)
  await setDoc(chatRef, { title }, { merge: true })
}

export async function deleteChat(uid, chatId) {
  await deleteDoc(doc(db, 'users', uid, 'chats', chatId))
}

export function makeTitleFromText(text) {
  const trimmed = text.trim()
  return trimmed.length > 42 ? trimmed.slice(0, 42) + '...' : trimmed
}
