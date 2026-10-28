import { useState } from 'react'

function InputBox({ onSend, disabled }) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <input
        style={{
          flex: 1,
          padding: '12px 0',
          border: 'none',
          borderBottom: '1px solid var(--line-dark)',
          background: 'transparent',
          fontSize: '15px',
          fontFamily: 'var(--font-sans)',
          color: 'var(--ink)',
          outline: 'none',
        }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Ask about syllabus, notices, calendar..."
        disabled={disabled}
      />
      <button className="btn-primary" onClick={handleSubmit} disabled={disabled}>
        Ask
      </button>
    </div>
  )
}

export default InputBox
