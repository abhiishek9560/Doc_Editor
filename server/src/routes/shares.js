import express from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

const router = express.Router()

// POST /api/shares - Share a document
router.post('/', async (req, res) => {
  try {
    const { documentId, email, permission } = req.body
    const userId = req.user.id

    // Verify user is the owner of the document
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('owner_id')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return res.status(404).json({
        error: 'Document not found',
      })
    }

    if (document.owner_id !== userId) {
      return res.status(403).json({
        error: 'You are not the owner of this document',
      })
    }

    // Look up the user by email
    const { data: targetUser, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (profileError || !targetUser) {
      return res.status(404).json({
        error: 'User not found',
      })
    }

    const sharedUserId = targetUser.id

    // Check if trying to share with yourself
    if (sharedUserId === userId) {
      return res.status(400).json({
        error: 'Cannot share with yourself',
      })
    }

    // Check if share already exists
    const { data: existingShare } = await supabaseAdmin
      .from('document_shares')
      .select('id')
      .eq('document_id', documentId)
      .eq('shared_with_id', sharedUserId)
      .single()

    if (existingShare) {
      // Update existing share
      const { data: updatedShare, error: updateError } = await supabaseAdmin
        .from('document_shares')
        .update({ permission })
        .eq('id', existingShare.id)
        .select()
        .single()

      if (updateError) throw updateError

      return res.json({
        message: 'Document share updated',
        share: {
          id: updatedShare.id,
          email,
          permission: updatedShare.permission,
        },
      })
    }

    // Create new share
    const { data: newShare, error: shareError } = await supabaseAdmin
      .from('document_shares')
      .insert([
        {
          document_id: documentId,
          shared_with_id: sharedUserId,
          shared_with_email: targetUser.email,
          permission: permission || 'view',
        },
      ])
      .select()
      .single()

    if (shareError) throw shareError

    res.status(201).json({
      message: 'Document shared successfully',
      share: {
        id: newShare.id,
        email,
        permission: newShare.permission,
      },
    })
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to share document',
    })
  }
})

// GET /api/shares/:documentId - Get all shares for a document
router.get('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params
    const userId = req.user.id

    // Verify user is the owner of the document
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('owner_id')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return res.status(404).json({
        error: 'Document not found',
      })
    }

    if (document.owner_id !== userId) {
      return res.status(403).json({
        error: 'You are not the owner of this document',
      })
    }

    // Fetch all shares with user details
    const { data: shares, error: sharesError } = await supabaseAdmin
      .from('document_shares')
      .select(`
        id,
        permission,
        profiles (email, full_name)
      `)
      .eq('document_id', documentId)

    if (sharesError) throw sharesError

    const formattedShares = (shares || []).map((share) => ({
      id: share.id,
      email: share.profiles?.email || 'Unknown',
      full_name: share.profiles?.full_name || null,
      permission: share.permission,
    }))

    res.json({
      shares: formattedShares,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to fetch shares',
    })
  }
})

// DELETE /api/shares/:shareId - Remove a share
router.delete('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params
    const userId = req.user.id

    // Fetch the share and verify ownership
    const { data: share, error: shareError } = await supabaseAdmin
      .from('document_shares')
      .select(`
        id,
        document_id,
        documents (owner_id)
      `)
      .eq('id', shareId)
      .single()

    if (shareError || !share) {
      return res.status(404).json({
        error: 'Share not found',
      })
    }

    if (share.documents.owner_id !== userId) {
      return res.status(403).json({
        error: 'You are not the owner of this document',
      })
    }

    // Delete the share
    const { error: deleteError } = await supabaseAdmin
      .from('document_shares')
      .delete()
      .eq('id', shareId)

    if (deleteError) throw deleteError

    res.json({
      message: 'Share removed',
    })
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to remove share',
    })
  }
})

export default router
