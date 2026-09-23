"use client";

import { useEffect, useState } from "react";

export default function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const shareText = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.error("Share failed", err);
      }
    }
  };

  if (!url) return null;

  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "40px", paddingTop: "24px", borderTop: "1px solid #E8ECF7" }}>
      <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#747CA1" }}>Share:</span>
      <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" style={btnStyle}>X / Twitter</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" style={btnStyle}>Facebook</a>
      <a href={`https://api.whatsapp.com/send?text=${shareText} ${shareUrl}`} target="_blank" rel="noopener noreferrer" style={btnStyle}>WhatsApp</a>
      {typeof navigator !== "undefined" && 'share' in navigator && (
        <button onClick={handleShare} style={{ ...btnStyle, background: "none" }}>Share...</button>
      )}
    </div>
  );
}

const btnStyle = {
  fontFamily: "'Poppins', sans-serif",
  fontSize: "12px",
  fontWeight: 500,
  color: "#0140C1",
  textDecoration: "none",
  padding: "6px 12px",
  backgroundColor: "#F4F6FB",
  borderRadius: "4px",
  border: "1px solid #E8ECF7",
  cursor: "pointer",
};
