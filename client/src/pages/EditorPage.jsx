import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Share2, Save, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDocumentStore } from '../store/documentStore'
import TiptapEditor from '../components/Editor/TiptapEditor'
import EditorToolbar from '../components/Editor/EditorToolbar'
import ShareModal from '../components/ShareModal'

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const currentDocument = useDocumentStore((state) => state.currentDocument)
  const fetchDocument = useDocumentStore((state) => state.fetchDocument)
  const updateDocument = useDocumentStore((state) => state.updateDocument)
  const isLoading = useDocumentStore((state) => state.isLoading)
  const isSaving = useDocumentStore((state) => state.isSaving)

  const [title, setTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [saveStatus, setSaveStatus] = useState('saved')
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [content, setContent] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [editor, setEditor] = useState(null)

  const saveTimeoutRef = useRef(null)

  useEffect(() => {
    const loadDocument = async () => {
      const result = await fetchDocument(id)
      if (!result.success) {
        toast.error(result.error)
        setTimeout(() => navigate('/'), 2000)
      }
    }

    loadDocument()
  }, [id, fetchDocument, navigate])

  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title)
      setContent(currentDocument.content || {})
    }
  }, [currentDocument])

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent)
    setHasChanges(true)
    setSaveStatus('unsaved')

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleAutoSave(newContent)
    }, 2000)
  }, [])

  const handleAutoSave = useCallback(
    async (contentToSave) => {
      setSaveStatus('saving')
      const result = await updateDocument(id, { content: contentToSave })

      if (result.success) {
        setSaveStatus('saved')
        setHasChanges(false)
      } else {
        setSaveStatus('unsaved')
        toast.error('Failed to save: ' + result.error)
      }
    },
    [id, updateDocument]
  )

  const handleManualSave = async () => {
    setSaveStatus('saving')
    const result = await updateDocument(id, { content })

    if (result.success) {
      setSaveStatus('saved')
      setHasChanges(false)
      toast.success('Document saved')
    } else {
      setSaveStatus('unsaved')
      toast.error('Failed to save')
    }
  }

  const handleTitleBlur = async () => {
    if (title !== currentDocument?.title) {
      const result = await updateDocument(id, { title })

      if (result.success) {
        toast.success('Title updated')
      } else {
        setTitle(currentDocument?.title)
        toast.error('Failed to update title')
      }
    }

    setIsEditingTitle(false)
  }

  const handleEditorInit = useCallback((editorInstance) => {
    setEditor(editorInstance)
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading document...</p>
      </div>
    )
  }

  if (!currentDocument) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Document not found</p>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  const canEdit = currentDocument?.is_owner || currentDocument?.permission === 'edit'

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Navbar */}
      <nav className="h-14 bg-white border-b border-gray-200 flex items-center px-6 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="p-1 rounded hover:bg-gray-100 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <span className="text-blue-600 font-bold">DocFlow</span>
        </div>

        <div className="flex-1 flex justify-center">
          {isEditingTitle ? (
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleBlur()
                if (e.key === 'Escape') {
                  setTitle(currentDocument.title)
                  setIsEditingTitle(false)
                }
              }}
              className="min-w-64 text-center font-semibold text-gray-800 border-none outline-none focus:bg-gray-50 focus:rounded px-2 py-1"
            />
          ) : (
            <h1
              onClick={() => canEdit && setIsEditingTitle(true)}
              className={`min-w-64 text-center font-semibold text-gray-800 ${
                canEdit ? 'cursor-text hover:bg-gray-50 hover:rounded px-2 py-1' : ''
              }`}
            >
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
              Saving...
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle size={16} />
              Saved
            </div>
          )}
          {saveStatus === 'unsaved' && !hasChanges && (
            <div className="flex items-center gap-1 text-amber-600 text-sm">
              <AlertCircle size={16} />
              Unsaved changes
            </div>
          )}

          {currentDocument?.is_owner && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm"
            >
              <Share2 size={16} />
              Share
            </button>
          )}

          {canEdit && (
            <button
              onClick={handleManualSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition text-sm"
            >
              <Save size={16} />
              Save
            </button>
          )}
        </div>
      </nav>

      {/* Toolbar */}
      <div className="shrink-0">
        <EditorToolbar editor={editor} />
      </div>

      {/* Editor Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full my-8 px-4">
          <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12"
            style={{ minHeight: 'calc(100vh - 200px)' }}
          >
            <TiptapEditor
              content={currentDocument?.content}
              onChange={handleContentChange}
              editable={true}
              onEditorInit={handleEditorInit}
            />
          </div>
        </div>
      </main>

      {currentDocument?.is_owner && (
        <ShareModal
          documentId={id}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  )
}
