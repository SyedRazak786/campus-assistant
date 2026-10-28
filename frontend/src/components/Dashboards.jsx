import { useEffect, useState } from 'react'
import ChatWindow from './ChatWindow'
import ChatSidebar from './ChatSidebar'
import { NoticesFeed, NoticeComposer } from './Notices'
import KnowledgeManager from './KnowledgeManager'
import { listenToChats, createChat, deleteChat } from '../lib/chats'
import '../knowledge.css'

export function StudentDashboard({ profile, uid }) {
  const firstName = (profile && profile.name ? profile.name : 'there').split(' ')[0]
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!uid) return
    const unsubscribe = listenToChats(uid, (list) => {
      setChats(list)
      setReady(true)
    })
    return unsubscribe
  }, [uid])

  useEffect(() => {
    if (!ready) return
    if (activeChatId) return

    if (chats.length > 0) {
      setActiveChatId(chats[0].id)
    } else {
      createChat(uid).then(setActiveChatId)
    }
  }, [ready, chats, activeChatId, uid])

  const handleNewChat = async () => {
    const id = await createChat(uid)
    setActiveChatId(id)
  }

  const handleDeleteChat = async (id) => {
    await deleteChat(uid, id)
    if (id === activeChatId) {
      const remaining = chats.filter((c) => c.id !== id)
      setActiveChatId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  return (
    <section className="wrap" style={{ padding: '72px 32px 120px', maxWidth: '920px' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Hello, {firstName}</h2>
      <p style={{ fontSize: '15px', marginBottom: '32px' }}>
        Ask anything about your syllabus, fees, exams, or notices.
      </p>

      <NoticesFeed />

      <div className="chat-layout">
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
          onNew={handleNewChat}
          onDelete={handleDeleteChat}
        />
        <div>
          {activeChatId ? (
            <ChatWindow uid={uid} chatId={activeChatId} />
          ) : (
            <p style={{ fontSize: '14.5px', color: 'var(--slate)' }}>Setting up your chat...</p>
          )}
        </div>
      </div>
    </section>
  )
}

export function FacultyDashboard({ profile, uid }) {
  const name = profile && profile.name ? profile.name : 'Faculty'
  const [tab, setTab] = useState('notices') // notices | knowledge

  return (
    <section className="wrap" style={{ padding: '72px 32px 120px', maxWidth: '760px' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Welcome, {name}</h2>
      <p style={{ fontSize: '15px', marginBottom: '28px' }}>
        Share notices with students, or teach the assistant new information.
      </p>

      <div className="k-tabs">
        <button
          className={`k-tab ${tab === 'notices' ? 'active' : ''}`}
          onClick={() => setTab('notices')}
        >
          Notices
        </button>
        <button
          className={`k-tab ${tab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setTab('knowledge')}
        >
          Knowledge base
        </button>
      </div>

      {tab === 'notices' ? <NoticeComposer uid={uid} name={name} /> : <KnowledgeManager />}
    </section>
  )
}