import { useEffect, useRef, useState } from 'react'
import { listDocuments, uploadDocument, addTextNote, deleteDocument } from '../api'
import '../knowledge.css'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function KnowledgeManager() {
  const [docs, setDocs] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'ok' | 'error', text }
  const fileInputRef = useRef(null)

  const refresh = async () => {
    try {
      setDocs(await listDocuments())
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setStatus(null)
    try {
      const result = await uploadDocument(file)
      setStatus({
        type: 'ok',
        text: `${result.replaced ? 'Updated' : 'Added'} "${result.filename}" (${result.sections} sections). Students can ask about it now.`,
      })
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await refresh()
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setUploading(false)
    }
  }

  const handleSaveNote = async (e) => {
    e.preventDefault()
    if (!noteTitle.trim() || !noteText.trim()) return
    setSavingNote(true)
    setStatus(null)
    try {
      const result = await addTextNote(noteTitle.trim(), noteText.trim())
      setStatus({
        type: 'ok',
        text: `Saved "${result.filename}". Students can ask about it now.`,
      })
      setNoteTitle('')
      setNoteText('')
      await refresh()
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setSavingNote(false)
    }
  }

  const handleDelete = async (name) => {
    if (!window.confirm(`Remove "${name}" from the assistant's knowledge?`)) return
    setStatus(null)
    try {
      await deleteDocument(name)
      setStatus({ type: 'ok', text: `Removed "${name}".` })
      await refresh()
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    }
  }

  const busy = uploading || savingNote

  return (
    <div>
      {status && <p className={`k-status ${status.type}`}>{status.text}</p>}
      {busy && (
        <p className="k-hint">
          Working on it... large or scanned PDFs can take a few minutes. Please keep this page open.
        </p>
      )}

      <div className="k-card">
        <h3 style={{ fontSize: '17px', marginBottom: '8px' }}>Upload a document</h3>
        <p className="k-hint">PDF or TXT, up to 15 MB. Uploading a file with the same name replaces the old version.</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
          disabled={busy}
          style={{ display: 'block', marginBottom: '14px', fontSize: '14px' }}
        />
        <button className="btn-primary" onClick={handleUpload} disabled={!file || busy}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      <div className="k-card">
        <h3 style={{ fontSize: '17px', marginBottom: '8px' }}>Add a text note</h3>
        <p className="k-hint">
          Type new information directly (for example a rule change or a new date). The assistant can answer from it right away.
        </p>
        <form onSubmit={handleSaveNote}>
          <input
            type="text"
            placeholder="Title, e.g. Revised holiday list"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            disabled={busy}
          />
          <textarea
            placeholder="Write the information here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            disabled={busy}
          />
          <button
            className="btn-primary"
            type="submit"
            disabled={busy || !noteTitle.trim() || !noteText.trim()}
          >
            {savingNote ? 'Saving...' : 'Add to knowledge base'}
          </button>
        </form>
      </div>

      <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>Documents the assistant knows</h3>
      {listLoading ? (
        <p className="k-hint">Loading...</p>
      ) : docs.length === 0 ? (
        <p className="k-hint">No documents yet.</p>
      ) : (
        docs.map((d) => (
          <div className="k-doc" key={d.name}>
            <div>
              <p className="k-doc-name">{d.name}</p>
              <p className="k-doc-size">{formatSize(d.size)}</p>
            </div>
            <button className="k-doc-delete" onClick={() => handleDelete(d.name)} disabled={busy}>
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  )
}

export default KnowledgeManager