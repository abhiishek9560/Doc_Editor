import { useState, useRef, useCallback } from 'react'
import { UploadCloud, File, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }, [])

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }, [])

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const response = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Document imported successfully')
      onUploadSuccess(response.data.document)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [selectedFile, onUploadSuccess, onClose])

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <h2 className="font-semibold text-xl text-gray-800">Import Document</h2>
        <p className="text-sm text-gray-500 mt-1">Upload a file to create a new editable document</p>

        <div
          className={`border-2 border-dashed rounded-xl p-10 mt-6 text-center cursor-pointer transition ${
            isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3 text-left">
              <File className="w-8 h-8 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">{formatSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFile()
                }}
                className="p-1 hover:bg-blue-200 rounded transition shrink-0"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ) : (
            <>
              <UploadCloud className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-gray-500 mt-3">Drag and drop your file here</p>
              <p className="text-blue-500 text-sm mt-1">or click to browse</p>
              <div className="flex justify-center gap-2 mt-4">
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded font-mono">.TXT</span>
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded font-mono">.MD</span>
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded font-mono">.DOCX</span>
              </div>
              <p className="text-xs text-gray-400 mt-3">Maximum file size: 5MB</p>
            </>
          )}
        </div>

        <input
          type="file"
          accept=".txt,.md,.docx"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />

        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition text-sm"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload & Open'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
