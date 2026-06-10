import express from 'express'
import multer from 'multer'
import mammoth from 'mammoth'
import { supabaseAdmin } from '../lib/supabase.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    const allowedExts = ['.txt', '.md', '.docx']
    const ext = '.' + file.originalname.split('.').pop().toLowerCase()

    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Only .txt, .md, and .docx files are supported'))
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
})

function textToTiptap(text) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)

  if (paragraphs.length === 0) return { type: 'doc', content: [{ type: 'paragraph' }] }

  const content = paragraphs.map((block) => {
    const lines = block.split('\n').filter((l) => l.trim())
    if (lines.length === 0) return { type: 'paragraph' }
    const textContent = lines.map((line) => ({
      type: 'text',
      text: line.trim(),
    }))
    return { type: 'paragraph', content: textContent }
  })

  return { type: 'doc', content }
}

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const originalName = req.file.originalname
    const ext = originalName.split('.').pop().toLowerCase()
    const title = originalName.slice(0, -(ext.length + 1))

    let rawText = ''

    if (ext === 'docx') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer })
      rawText = result.value
    } else {
      rawText = req.file.buffer.toString('utf-8')
    }

    const content = textToTiptap(rawText)

    const { data: document, error } = await supabaseAdmin
      .from('documents')
      .insert({
        title,
        content,
        owner_id: req.user.id,
      })
      .select('id, title, content, created_at')
      .single()

    if (error) throw error

    res.status(201).json({ document })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
