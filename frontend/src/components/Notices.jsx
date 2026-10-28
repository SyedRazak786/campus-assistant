import { useEffect, useState } from 'react'
import { listenToNotices, postNotice, deleteNotice, formatNoticeDate } from '../lib/notices'
import '../notices.css'

export function NoticesFeed() {
  const [notices, setNotices] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const unsubscribe = listenToNotices((list) => {
      setNotices(list)
      setReady(true)
    })
    return unsubscribe
  }, [])

  if (!ready) return null

  return (
    <div className="notice-feed">
      <h3 style={{ fontSize: '17px', marginBottom: '14px' }}>Notices</h3>
      {notices.length === 0 ? (
        <p className="notice-empty">No notices yet.</p>
      ) : (
        notices.map((n) => (
          <div className="notice-item" key={n.id}>
            <p className="notice-meta">
              {n.authorName || 'Faculty'} - {formatNoticeDate(n.createdAt)}
            </p>
            <p className="notice-text">{n.text}</p>
          </div>
        ))
      )}
    </div>
  )
}

export function NoticeComposer({ uid, name }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [notices, setNotices] = useState([])

  useEffect(() => {
    const unsubscribe = listenToNotices(setNotices)
    return unsubscribe
  }, [])

  const myNotices = notices.filter((n) => n.authorUid === uid)

  const handlePost = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      await postNotice(uid, name, trimmed)
      setText('')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id) => {
    await deleteNotice(id)
  }

  return (
    <div>
      <div className="notice-composer">
        <h3 style={{ fontSize: '17px', marginBottom: '14px' }}>Post a notice</h3>
        <form onSubmit={handlePost}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share a new announcement, deadline, or update with all students..."
          />
          <button className="btn-primary" type="submit" disabled={busy || !text.trim()}>
            {busy ? 'Posting...' : 'Post notice'}
          </button>
        </form>
      </div>

      <h3 style={{ fontSize: '17px', marginBottom: '14px' }}>Your notices</h3>
      {myNotices.length === 0 ? (
        <p className="notice-empty">You haven't posted any notices yet.</p>
      ) : (
        myNotices.map((n) => (
          <div className="notice-item" key={n.id}>
            <p className="notice-meta">{formatNoticeDate(n.createdAt)}</p>
            <p className="notice-text">{n.text}</p>
            <button className="notice-delete" onClick={() => handleDelete(n.id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  )
}