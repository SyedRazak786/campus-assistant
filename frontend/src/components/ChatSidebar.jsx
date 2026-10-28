import '../chat-sidebar.css'

function ChatSidebar({ chats, activeChatId, onSelect, onNew, onDelete }) {
  return (
    <aside className="chat-sidebar">
      <button className="chat-sidebar-new" onClick={onNew}>
        + New chat
      </button>

      <div className="chat-sidebar-list">
        {chats.length === 0 && (
          <p className="chat-sidebar-empty">No chats yet. Start one above.</p>
        )}
        {chats.map((chat) => (
          <button
            key={chat.id}
            className={`chat-sidebar-item ${chat.id === activeChatId ? 'active' : ''}`}
            onClick={() => onSelect(chat.id)}
          >
            <span className="chat-sidebar-item-title">{chat.title || 'New chat'}</span>
            <span
              className="chat-sidebar-item-delete"
              role="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(chat.id)
              }}
            >
              ✕
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}

export default ChatSidebar
