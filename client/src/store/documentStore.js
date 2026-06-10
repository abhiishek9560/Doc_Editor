import { create } from 'zustand'
import api from '../lib/api'

export const useDocumentStore = create((set) => ({
  ownedDocuments: [],
  sharedDocuments: [],
  currentDocument: null,
  isLoading: false,
  isSaving: false,

  fetchDocuments: async () => {
    set({ isLoading: true })
    try {
      const response = await api.get('/api/documents')
      const { owned, shared } = response.data

      set({
        ownedDocuments: owned || [],
        sharedDocuments: shared || [],
        isLoading: false,
      })

      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.error || 'Failed to fetch documents' }
    }
  },

  createDocument: async (title) => {
    set({ isSaving: true })
    try {
      const response = await api.post('/api/documents', { title })
      const newDoc = response.data

      set((state) => ({
        ownedDocuments: [newDoc, ...state.ownedDocuments],
        isSaving: false,
      }))

      return { success: true, document: newDoc }
    } catch (error) {
      set({ isSaving: false })
      return { success: false, error: error.response?.data?.error || 'Failed to create document' }
    }
  },

  fetchDocument: async (id) => {
    set({ isLoading: true })
    try {
      const response = await api.get(`/api/documents/${id}`)
      const document = response.data

      set({
        currentDocument: document,
        isLoading: false,
      })

      return { success: true, document }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.error || 'Failed to fetch document' }
    }
  },

  setCurrentDocument: (document) => {
    set({ currentDocument: document })
  },

  updateDocument: async (id, data) => {
    set({ isSaving: true })
    try {
      const response = await api.put(`/api/documents/${id}`, data)
      const updatedDoc = response.data

      set((state) => {
        // Update in ownedDocuments
        const ownedIndex = state.ownedDocuments.findIndex((doc) => doc.id === id)
        const updatedOwned = [...state.ownedDocuments]
        if (ownedIndex >= 0) {
          updatedOwned[ownedIndex] = { ...updatedOwned[ownedIndex], ...updatedDoc }
        }

        // Update in sharedDocuments
        const sharedIndex = state.sharedDocuments.findIndex((doc) => doc.id === id)
        const updatedShared = [...state.sharedDocuments]
        if (sharedIndex >= 0) {
          updatedShared[sharedIndex] = { ...updatedShared[sharedIndex], ...updatedDoc }
        }

        // Update currentDocument
        let updatedCurrent = state.currentDocument
        if (updatedCurrent && updatedCurrent.id === id) {
          updatedCurrent = { ...updatedCurrent, ...updatedDoc }
        }

        return {
          ownedDocuments: updatedOwned,
          sharedDocuments: updatedShared,
          currentDocument: updatedCurrent,
          isSaving: false,
        }
      })

      return { success: true, document: updatedDoc }
    } catch (error) {
      set({ isSaving: false })
      return { success: false, error: error.response?.data?.error || 'Failed to update document' }
    }
  },

  deleteDocument: async (id) => {
    set({ isSaving: true })
    try {
      await api.delete(`/api/documents/${id}`)

      set((state) => ({
        ownedDocuments: state.ownedDocuments.filter((doc) => doc.id !== id),
        sharedDocuments: state.sharedDocuments.filter((doc) => doc.id !== id),
        isSaving: false,
      }))

      return { success: true }
    } catch (error) {
      set({ isSaving: false })
      return { success: false, error: error.response?.data?.error || 'Failed to delete document' }
    }
  },
}))
