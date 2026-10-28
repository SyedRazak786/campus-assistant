import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
import InputBox from './InputBox'
import { askQuestion } from '../api'
import { listenToMessages, addMessage, setChatTitle, makeTitleFromText } from '../lib/chats'

function ChatWindow({ uid, chatId }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const isFirstMessageRef = useRef(true)

  useEffect(() => {
    if (!chatId) return
    isFirstMessageRef.current = true
    const unsubscribe = listenToMessages(uid, chatId, (msgs) => {
      setMessages(msgs)
      if (msgs.length > 0) isFirstMessageRef.current = false
    })
    return unsubscribe
  }, [uid, chatId])

  const handleSend = async (text) => {
    if (!chatId) return

    const wasFirstMessage = isFirstMessageRef.current
    isFirstMessageRef.current = false

    setLoading(true)
    try {
      await addMessage(uid, chatId, 'user', text)
      if (wasFirstMessage) {
        await setChatTitle(uid, chatId, makeTitleFromText(text))
      }

      const answer = await askQuestion(text)
      await addMessage(uid, chatId, 'assistant', answer)
    } catch (err) {
      await addMessage(uid, chatId, 'assistant', 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--paper-card)', border: '1px solid var(--line)' }}>
      <div style={{ minHeight: '320px', maxHeight: '440px', overflowY: 'auto', padding: '28px' }}>
        {messages.length === 0 && !loading && (
          <p style={{ fontSize: '14.5px', color: 'var(--slate)' }}>
            Ask about your syllabus, exam dates, notices, or placement rules.
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} text={msg.text} />
        ))}
        {loading && <MessageBubble role="assistant" text="Looking through the documents..." />}
      </div>
      <hr className="hairline" />
      <div style={{ padding: '20px 24px' }}>
        <InputBox onSend={handleSend} disabled={loading} />
      </div>
    </div>
  )
}

export default ChatWindow
