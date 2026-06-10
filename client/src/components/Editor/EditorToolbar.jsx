import {
  Heading1,
  Heading2,
  Heading3,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'

export default function EditorToolbar({ editor }) {
  if (!editor) return null

  const buttons = [
    // Text styles
    [
      {
        icon: Heading1,
        label: 'H1',
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: editor.isActive('heading', { level: 1 }),
      },
      {
        icon: Heading2,
        label: 'H2',
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor.isActive('heading', { level: 2 }),
      },
      {
        icon: Heading3,
        label: 'H3',
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: editor.isActive('heading', { level: 3 }),
      },
      {
        icon: Type,
        label: 'P',
        action: () => editor.chain().focus().setParagraph().run(),
        isActive: editor.isActive('paragraph'),
      },
    ],
    // Inline formatting
    [
      {
        icon: Bold,
        label: 'B',
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive('bold'),
      },
      {
        icon: Italic,
        label: 'I',
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive('italic'),
      },
      {
        icon: Underline,
        label: 'U',
        action: () => editor.chain().focus().toggleUnderline().run(),
        isActive: editor.isActive('underline'),
      },
    ],
    // Lists
    [
      {
        icon: List,
        label: 'Bullet List',
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive('bulletList'),
      },
      {
        icon: ListOrdered,
        label: 'Ordered List',
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive('orderedList'),
      },
    ],
    // Alignment
    [
      {
        icon: AlignLeft,
        label: 'Align Left',
        action: () => editor.chain().focus().setTextAlign('left').run(),
        isActive: editor.isActive({ textAlign: 'left' }),
      },
      {
        icon: AlignCenter,
        label: 'Align Center',
        action: () => editor.chain().focus().setTextAlign('center').run(),
        isActive: editor.isActive({ textAlign: 'center' }),
      },
      {
        icon: AlignRight,
        label: 'Align Right',
        action: () => editor.chain().focus().setTextAlign('right').run(),
        isActive: editor.isActive({ textAlign: 'right' }),
      },
    ],
  ]

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-2">
      <div className="flex flex-wrap gap-0.5">
        {buttons.map((group, groupIdx) => (
          <div key={groupIdx} className="flex gap-0.5">
            {group.map((btn, btnIdx) => {
              const Icon = btn.icon
              return (
                <button
                  key={btnIdx}
                  onClick={btn.action}
                  title={btn.label}
                  className={`p-2 rounded transition ${
                    btn.isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                </button>
              )
            })}
            {groupIdx < buttons.length - 1 && (
              <div className="border-r border-gray-200 mx-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
