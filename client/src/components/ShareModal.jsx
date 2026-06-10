import { useEffect, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function ShareModal({ documentId, isOpen, onClose }) {
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState('view')
  const [shares, setShares] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingShares, setIsLoadingShares] = useState(false)

  // Fetch shares when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchShares()
    }
  }, [isOpen])

  const fetchShares = async () => {
    setIsLoadingShares(true)
    try {
      const response = await api.get(`/api/shares/${documentId}`)
      setShares(response.data.shares || [])
    } catch (error) {
      console.error('Failed to fetch shares:', error)
      toast.error('Failed to fetch shares')
    } finally {
      setIsLoadingShares(false)
    }
  }

  const handleShare = async (e) => {
    e.preventDefault()

    if (!shareEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setIsLoading(true)
    try {
      await api.post('/api/shares', {
        documentId,
        email: shareEmail,
        permission: sharePermission,
      })

      toast.success(`Document shared with ${shareEmail}`)
      setShareEmail('')
      setSharePermission('view')
      await fetchShares()
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('User not found')
      } else {
        toast.error(error.response?.data?.error || 'Failed to share document')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveShare = async (shareId) => {
    if (!window.confirm('Remove this share?')) return

    try {
      await api.delete(`/api/shares/${shareId}`)
      toast.success('Share removed')
      await fetchShares()
    } catch (error) {
      toast.error('Failed to remove share')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Share Document</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Share Form */}
        <form onSubmit={handleShare} className="mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              placeholder="Enter email address"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={sharePermission}
              onChange={(e) => setSharePermission(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="view">View</option>
              <option value="edit">Edit</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
          >
            {isLoading ? 'Sharing...' : 'Share'}
          </button>
        </form>

        {/* Shares List */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Shared with:</h3>

          {isLoadingShares ? (
            <p className="text-gray-500 text-sm">Loading shares...</p>
          ) : shares.length === 0 ? (
            <p className="text-gray-500 text-sm">Not shared with anyone yet</p>
          ) : (
            <div className="space-y-2">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">
                        {share.email.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {share.email}
                      </p>
                      {share.full_name && (
                        <p className="text-xs text-gray-500 truncate">
                          {share.full_name}
                        </p>
                      )}
                    </div>

                    {/* Permission Badge */}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        share.permission === 'edit'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {share.permission}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveShare(share.id)}
                    className="p-1 hover:bg-red-100 rounded-lg transition ml-2"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
