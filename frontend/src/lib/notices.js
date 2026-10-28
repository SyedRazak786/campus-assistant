import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const noticesRef = collection(db, 'notices')

/** Live-subscribe to the most recent notices, newest first. */
export function listenToNotices(callback, max = 20) {
  const q = query(noticesRef, orderBy('createdAt', 'desc'), limit(max))
  return onSnapshot(q, (snap) => {
    const notices = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(notices)
  })
}

export async function postNotice(authorUid, authorName, text) {
  await addDoc(noticesRef, {
    text,
    authorUid,
    authorName,
    createdAt: serverTimestamp(),
  })
}

export async function deleteNotice(noticeId) {
  await deleteDoc(doc(db, 'notices', noticeId))
}

export function formatNoticeDate(ts) {
  if (!ts || !ts.toDate) return ''
  const d = ts.toDate()
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}