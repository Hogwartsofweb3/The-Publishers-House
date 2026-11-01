"use client";

import { useState, useRef } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const labelStyle = {
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 600 as const,
  fontSize: "11px",
  letterSpacing: "0.16em",
  textTransform: "uppercase" as const,
  display: "block",
  marginBottom: "8px",
  color: "#4A62A0",
};

async function compressImageBeforeUpload(file: File): Promise<Blob | File> {
  if (
    !file.type.startsWith("image/") ||
    file.type.includes("svg") ||
    file.type.includes("gif")
  ) {
    return file;
  }

  // Already lightweight
  if (file.size <= 250 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round(height * (MAX_DIM / width));
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round(width * (MAX_DIM / height));
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.82
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export default function ImageUpload({
  value,
  onChange,
  label = "Cover Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setUploading(true);
    setProgress(10);

    // Auto-compress high-res image so website always loads fast
    const compressedBlob = await compressImageBeforeUpload(file);

    const ext = "jpg";
    const uniqueName = Date.now() + "_" + Math.random().toString(36).slice(2) + "." + ext;
    const storageRef = ref(storage, "uploads/" + uniqueName);

    const task = uploadBytesResumable(storageRef, compressedBlob);
    task.on(
      "state_changed",
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => { console.error("Upload error", err); setUploading(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        onChange(url);
        setUploading(false);
        setProgress(0);
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) uploadFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) uploadFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <label style={labelStyle}>{label}</label>

      {value ? (
        /* Preview */
        <div style={{ position: "relative", display: "inline-block", maxWidth: "100%", borderRadius: "6px", overflow: "hidden", border: "1px solid #D3DAEC" }}>
          <img src={value} alt="Preview" style={{ display: "block", maxHeight: "200px", maxWidth: "100%", objectFit: "cover" }} />
          <button
            type="button"
            onClick={() => onChange("")}
            style={{
              position: "absolute", top: "8px", right: "8px",
              background: "rgba(0,0,0,0.65)", color: "#fff",
              border: "none", borderRadius: "4px",
              padding: "4px 10px", cursor: "pointer",
              fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600,
            }}
          >
            Remove
          </button>
        </div>
      ) : uploading ? (
        /* Progress */
        <div style={{ padding: "20px", border: "1px solid #D3DAEC", borderRadius: "6px", backgroundColor: "#F4F6FB" }}>
          <div style={{ height: "4px", backgroundColor: "#E8ECF7", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: progress + "%", backgroundColor: "#0140C1", transition: "width 200ms ease" }} />
          </div>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: "#747CA1", margin: "10px 0 0", textAlign: "center" }}>
            Uploading… {progress}%
          </p>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            padding: "28px 20px",
            border: dragOver ? "2px solid #0140C1" : "2px dashed #D3DAEC",
            borderRadius: "6px",
            backgroundColor: dragOver ? "#EFF4FF" : "#F4F6FB",
            cursor: "pointer",
            textAlign: "center",
            transition: "border-color 150ms ease, background-color 150ms ease",
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>📷</div>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: 500, color: "#0140C1", margin: "0 0 4px" }}>
            Click to upload or drag &amp; drop
          </p>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "#747CA1", margin: 0 }}>
            PNG, JPG, WebP — max 10 MB
          </p>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </div>
      )}
    </div>
  );
}
