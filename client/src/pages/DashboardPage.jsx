import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Book, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useDocumentStore } from '../store/documentStore'
import DocumentCard from '../components/DocumentCard'
import UploadModal from '../components/UploadModal'

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const ownedDocuments = useDocumentStore((state) => state.ownedDocuments)
  const sharedDocuments = useDocumentStore((state) => state.sharedDocuments)
  const isLoading = useDocumentStore((state) => state.isLoading)
  const isSaving = useDocumentStore((state) => state.isSaving)

  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments)
  const createDocument = useDocumentStore((state) => state.createDocument)
  const updateDocument = useDocumentStore((state) => state.updateDocument)
  const deleteDocument = useDocumentStore((state) => state.deleteDocument)

  const [isCreating, setIsCreating] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const handleCreateDocument = async () => {
    setIsCreating(true)
    const result = await createDocument('Untitled Document')
    setIsCreating(false)

    if (result.success) {
      toast.success('Document created')
      navigate(`/document/${result.document.id}`)
    } else {
      toast.error(result.error)
    }
  }

  const handleOpenDocument = (id) => {
    navigate(`/document/${id}`)
  }

  const handleRenameDocument = async (id, newTitle) => {
    const result = await updateDocument(id, { title: newTitle })
    if (result.success) {
      toast.success('Document renamed')
      await fetchDocuments()
    } else {
      toast.error(result.error)
    }
  }

  const handleDeleteDocument = async (id) => {
    const result = await deleteDocument(id)
    if (result.success) {
      toast.success('Document deleted')
      await fetchDocuments()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DocFlow</h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.full_name || user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading documents...</p>
          </div>
        ) : (
          <>
            {/* My Documents Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Documents</h2>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Import File
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* New Document Card */}
                <DocumentCard
                  isNewDocCard
                  onClick={handleCreateDocument}
                />

                {/* Document Cards */}
                {ownedDocuments.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No documents yet. Create one to get started!
                  </div>
                ) : (
                  ownedDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      isShared={false}
                      onClick={() => handleOpenDocument(doc.id)}
                      onRename={handleRenameDocument}
                      onDelete={handleDeleteDocument}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Shared Documents Section */}
            {sharedDocuments.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Shared with Me</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sharedDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      isShared={true}
                      onClick={() => handleOpenDocument(doc.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={(doc) => {
          navigate(`/document/${doc.id}`)
        }}
      />
    </div>
  )
}
