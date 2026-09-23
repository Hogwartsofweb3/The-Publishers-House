"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

const Navy = "#151A54";
const Blue700 = "#0140C1";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const Slate500 = "#747CA1";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
      Placeholder.configure({ placeholder: "Write your article here. Use the toolbar above to format text, add images, and insert links..." }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. when editing an existing article)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const ToolBtn = ({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: "6px 10px",
        border: "none",
        borderRadius: "3px",
        cursor: "pointer",
        backgroundColor: active ? Navy : "transparent",
        color: active ? "#fff" : Navy,
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600,
        fontSize: "12px",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );

  const addImage = () => {
    const url = window.prompt("Image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = window.prompt("Link URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div style={{ border: `1px solid ${Paper300}`, borderRadius: "4px", overflow: "hidden", backgroundColor: "#fff" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2px",
          padding: "8px 10px",
          borderBottom: `1px solid ${Paper300}`,
          backgroundColor: Paper200,
        }}
      >
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><b>B</b></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><i>I</i></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><s>S</s></ToolBtn>

        <div style={{ width: "1px", backgroundColor: Paper300, margin: "2px 4px", alignSelf: "stretch" }} />

        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">H1</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">H2</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">H3</ToolBtn>

        <div style={{ width: "1px", backgroundColor: Paper300, margin: "2px 4px", alignSelf: "stretch" }} />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">• List</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">1. List</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">" Quote</ToolBtn>

        <div style={{ width: "1px", backgroundColor: Paper300, margin: "2px 4px", alignSelf: "stretch" }} />

        <ToolBtn onClick={addLink} active={editor.isActive("link")} title="Insert Link">🔗 Link</ToolBtn>
        <ToolBtn onClick={addImage} active={false} title="Insert Image">🖼 Image</ToolBtn>

        <div style={{ width: "1px", backgroundColor: Paper300, margin: "2px 4px", alignSelf: "stretch" }} />

        <ToolBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">↩ Undo</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">↪ Redo</ToolBtn>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        style={{ minHeight: "380px", padding: "20px 24px", fontFamily: "'Playfair Display', serif", fontSize: "16px", lineHeight: "1.7em", color: Navy }}
      />

      {/* Editor styles injected inline */}
      <style>{`
        .tiptap { outline: none; }
        .tiptap h1 { font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 800; margin: 24px 0 12px; color: ${Navy}; }
        .tiptap h2 { font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 700; margin: 20px 0 10px; color: ${Navy}; }
        .tiptap h3 { font-family: 'Poppins', sans-serif; font-size: 18px; font-weight: 700; margin: 16px 0 8px; color: ${Navy}; }
        .tiptap p { margin: 0 0 14px; }
        .tiptap ul, .tiptap ol { padding-left: 24px; margin: 0 0 14px; }
        .tiptap li { margin-bottom: 6px; }
        .tiptap blockquote { border-left: 3px solid ${Blue700}; padding-left: 16px; color: ${Slate500}; font-style: italic; margin: 20px 0; }
        .tiptap a { color: ${Blue700}; text-decoration: underline; }
        .tiptap img { max-width: 100%; border-radius: 4px; margin: 16px 0; }
        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: ${Slate500}; pointer-events: none; height: 0; }
      `}</style>
    </div>
  );
}
