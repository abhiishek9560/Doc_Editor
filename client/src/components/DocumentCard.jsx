import { useRef, useState, useEffect } from 'react'
import { FileText, MoreVertical, Plus } from 'lucide-react'

export default function DocumentCard({ document: doc, isShared, isNewDocCard, onRename, onDelete, onClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(doc?.title || '')
  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    window.document.addEventListener('mousedown', handleOutside)
    return () => window.document.removeEventListener('mousedown', handleOutside)
  }, [])

  if (isNewDocCard) {
    return (
      <div
        onClick={onClick}
        className="h-48 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3"
      >
        <Plus className="w-10 h-10 text-blue-600" />
        <p className="text-blue-600 font-medium text-sm">New Document</p>
      </div>
    )
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`
  }

  return (
    <div
      className="h-48 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer p-6 flex flex-col relative"
      onClick={onClick}
    >
      {/* Shared Badge */}
      {isShared && (
        <div className="absolute top-4 right-4">
          <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-3 py-1">
            Shared
          </span>
        </div>
      )}

      {/* Menu Button (only for owned docs) */}
      {!isShared && (
        <div ref={menuRef} className="absolute top-4 right-4" onClick={e => e.stopPropagation()}>
          <button
            className="p-1 rounded hover:bg-gray-200 text-gray-400"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(prev => !prev)
            }}
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-36 py-1">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  setRenameValue(doc.title)
                  setIsRenaming(true)
                }}
              >
                Rename
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  if (window.confirm('Delete this document?')) {
                    onDelete(doc.id)
                  }
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Icon */}
        <div className="bg-blue-100 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>

        {/* Title */}
        {isRenaming ? (
          <input
            autoFocus
            className="font-semibold text-gray-800 border-b border-blue-400 outline-none bg-transparent w-full"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={() => {
              onRename(doc.id, renameValue)
              setIsRenaming(false)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                onRename(doc.id, renameValue)
                setIsRenaming(false)
              }
              if (e.key === 'Escape') {
                setRenameValue(doc.title)
                setIsRenaming(false)
              }
            }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <p className="font-semibold text-gray-800 truncate">{doc.title}</p>
        )}

        {/* Metadata */}
        <div className="mt-auto space-y-1">
          <p className="text-xs text-gray-400">
            Edited {formatDate(doc.updated_at)}
          </p>
          {isShared && (
            <p className="text-xs text-gray-500">
              By {doc.owner_email}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
