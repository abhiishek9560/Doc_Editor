import express from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = express.Router()

// GET /api/documents - Fetch all documents (owned + shared)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id

    // Fetch owned documents
    const { data: ownedDocs, error: ownedError } = await supabaseAdmin
      .from('documents')
      .select('id, title, created_at, updated_at, owner_id')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })

    if (ownedError) throw ownedError

    // Fetch shared documents
    const { data: sharedDocs, error: sharedError } = await supabaseAdmin
      .from('document_shares')
      .select(`
        document_id,
        permission,
        documents (id, title, created_at, updated_at, owner_id)
      `)
      .eq('shared_with_id', userId)
      .order('created_at', { ascending: false })

    if (sharedError) throw sharedError

    // Fetch owner profiles for shared documents
    const ownerIds = [...new Set(sharedDocs.map(s => s.documents?.owner_id).filter(Boolean))]
    let ownerProfiles = {}
    if (ownerIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .in('id', ownerIds)
      if (profiles) {
        profiles.forEach(p => { ownerProfiles[p.id] = p.email })
      }
    }

    // Transform shared documents
    const shared = sharedDocs
      .map((share) => ({
        id: share.documents.id,
        title: share.documents.title,
        created_at: share.documents.created_at,
        updated_at: share.documents.updated_at,
        owner_id: share.documents.owner_id,
        permission: share.permission,
        owner_email: ownerProfiles[share.documents.owner_id] || 'Unknown',
      }))
      .filter((doc) => doc.id) // Remove invalid entries

    res.json({
      owned: ownedDocs || [],
      shared: shared || [],
    })
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to fetch documents',
    })
  }
})

// POST /api/documents - Create new document
router.post('/', async (req, res) => {
  try {
    const { title = 'Untitled Document' } = req.body
    const userId = req.user.id

    if (title && title.length > 200) {
      return res.status(400).json({
        error: 'Title must not exceed 200 characters',
      })
    }

    const { data: newDoc, error } = await supabaseAdmin
      .from('documents')
      .insert([
        {
          title,
          content: {},
          owner_id: userId,
        },
      ])
      .select()
      .single()

    if (error) throw error

    res.status(201).json(newDoc)
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to create document',
    })
  }
})

// GET /api/documents/:id - Fetch single document with access check
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Fetch the document
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()

    if (docError || !document) {
      return res.status(404).json({
        error: 'Document not found',
      })
    }

    // Check access: owner OR shared with user
    const isOwner = document.owner_id === userId
    let permission = 'owner'

    if (!isOwner) {
      const { data: share, error: shareError } = await supabaseAdmin
        .from('document_shares')
        .select('permission')
        .eq('document_id', id)
        .eq('shared_with_id', userId)
        .single()

      if (shareError || !share) {
        return res.status(403).json({
          error: 'Access denied',
        })
      }

      permission = share.permission
    }

    res.json({
      ...document,
      is_owner: isOwner,
      permission,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to fetch document',
    })
  }
})

// PUT /api/documents/:id - Update document
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, content } = req.body
    const userId = req.user.id

    // Fetch document to check access
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (docError || !document) {
      return res.status(404).json({
        error: 'Document not found',
      })
    }

    const isOwner = document.owner_id === userId

    // Check edit permission
    if (!isOwner) {
      const { data: share, error: shareError } = await supabaseAdmin
        .from('document_shares')
        .select('permission')
        .eq('document_id', id)
        .eq('shared_with_id', userId)
        .single()

      if (shareError || !share || share.permission !== 'edit') {
        return res.status(403).json({
          error: 'Access denied',
        })
      }
    }

    // Validate title
    if (title && title.length > 200) {
      return res.status(400).json({
        error: 'Title must not exceed 200 characters',
      })
    }

    // Build update object
    const updateData = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) {
      updateData.title = title
    }

    if (content !== undefined) {
      updateData.content = content
    }

    const { data: updatedDoc, error } = await supabaseAdmin
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json(updatedDoc)
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to update document',
    })
  }
})

// DELETE /api/documents/:id - Delete document (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Fetch document to check ownership
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (docError || !document) {
      return res.status(404).json({
        error: 'Document not found',
      })
    }

    if (document.owner_id !== userId) {
      return res.status(403).json({
        error: 'Only the owner can delete this document',
      })
    }

    const { error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({
      message: 'Document deleted',
    })
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to delete document',
    })
  }
})

export default router
