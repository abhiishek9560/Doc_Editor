import { EditorContent as TiptapEditorContent } from '@tiptap/react'

export default function EditorContent({ editor }) {
  if (!editor) {
    return null
  }

  return (
    <TiptapEditorContent
      editor={editor}
      className="prose prose-lg max-w-none focus:outline-none"
    />
  )
}
