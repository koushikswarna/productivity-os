"use client"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Image from "@tiptap/extension-image"
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Quote, Minus, Undo, Redo, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface EditorProps { content: any; onChange: (content: any) => void }

export function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: { attributes: { class: "prose prose-sm dark:prose-invert max-w-none p-4 focus:outline-none min-h-[500px]" } },
  })

  if (!editor) return null

  const ToolbarButton = ({ onClick, isActive, children }: { onClick: () => void; isActive?: boolean; children: React.ReactNode }) => (
    <Button variant="ghost" size="icon" className={cn("h-8 w-8", isActive && "bg-muted")} onClick={onClick}>{children}</Button>
  )

  return (
    <div>
      <div className="flex items-center gap-0.5 p-2 border-b flex-wrap">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")}><Bold className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")}><Italic className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")}><Strikethrough className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")}><Code className="h-4 w-4" /></ToolbarButton>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })}><Heading1 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })}><Heading2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })}><Heading3 className="h-4 w-4" /></ToolbarButton>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")}><List className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")}><ListOrdered className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive("taskList")}><CheckSquare className="h-4 w-4" /></ToolbarButton>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")}><Quote className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => { const url = window.prompt("Image URL"); if (url) editor.chain().focus().setImage({ src: url }).run() }}><ImageIcon className="h-4 w-4" /></ToolbarButton>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}><Undo className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}><Redo className="h-4 w-4" /></ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
