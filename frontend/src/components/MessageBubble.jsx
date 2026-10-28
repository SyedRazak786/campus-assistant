function MessageBubble({ role, text }) {
  const isUser = role === 'user'
  return (
    <div style={{ marginBottom: '18px' }}>
      <p style={{ fontSize: '11.5px', color: 'var(--gold-deep)', marginBottom: '4px' }}>
        {isUser ? 'You' : 'Assistant'}
      </p>
      <p
        style={{
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--ink)',
          fontFamily: isUser ? 'var(--font-serif)' : 'var(--font-sans)',
          fontStyle: isUser ? 'italic' : 'normal',
          maxWidth: '85%',
        }}
      >
        {text}
      </p>
    </div>
  )
}

export default MessageBubble
