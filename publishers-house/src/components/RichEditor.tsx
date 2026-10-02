"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextAlign } from "@tiptap/extension-text-align";
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
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

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

  const Divider = () => <div style={{ width: "1px", backgroundColor: Paper300, margin: "2px 4px", alignSelf: "stretch" }} />;

  const addImage = () => {
    const url = window.prompt("Image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = window.prompt("Link URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addColor = () => {
    const color = window.prompt("Hex color code (e.g. #FF0000):", "#0140C1");
    if (color) editor.chain().focus().setColor(color).run();
  };

  const addHighlight = () => {
    const color = window.prompt("Highlight hex color code (e.g. #FFFF00):", "#FFFF00");
    if (color) editor.chain().focus().toggleHighlight({ color }).run();
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
        <ToolBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Normal Text">Normal</ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><b>B</b></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><i>I</i></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><s>S</s></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code">{"</>"}</ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript">X₂</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript">X²</ToolBtn>
        <Divider />
        <ToolBtn onClick={addColor} title="Text Color">Color</ToolBtn>
        <ToolBtn onClick={addHighlight} active={editor.isActive("highlight")} title="Highlight">Highlighter</ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">Left</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">Center</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">Right</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">Justify</ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">H1</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">H2</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">H3</ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">• List</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">1. List</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">" Quote</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">Code Block</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">--- Divider</ToolBtn>
        <Divider />
        <ToolBtn onClick={addLink} active={editor.isActive("link")} title="Insert Link">🔗 Link</ToolBtn>
        <ToolBtn onClick={addImage} title="Insert Image">🖼 Image</ToolBtn>
        <ToolBtn onClick={() => window.alert("Polls coming soon!")} title="Poll">Polls</ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">↩ Undo</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">↪ Redo</ToolBtn>
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
        .tiptap pre { background: #0A0D2A; color: #E8ECF7; padding: 16px; border-radius: 4px; font-family: monospace; overflow-x: auto; margin: 16px 0; }
        .tiptap code { font-family: monospace; background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 3px; }
        .tiptap pre code { background: none; padding: 0; }
        .tiptap hr { border: none; border-top: 1px solid ${Paper300}; margin: 32px 0; }
        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: ${Slate500}; pointer-events: none; height: 0; }
        mark { background-color: inherit; }
      `}</style>
    </div>
  );
}
