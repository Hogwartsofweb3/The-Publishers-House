"use client";

import { useState } from "react";
import type { Sermon } from "@/lib/firebase";

const Navy    = "#151A54";
const Blue500 = "#2090FF";
const Blue700 = "#0140C1";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const White   = "#FFFFFF";

const T = {
  displayS:  { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "17px", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  eyebrow:   { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  colophon:  { fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  readBody:  { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "15px", lineHeight: "1.6em" },
  button:    { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const, cursor: "pointer" },
};

export default function SermonCard({ sermon }: { sermon: Sermon }) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const dateLabel = sermon.date
    ? new Date(sermon.date).toLocaleDateString(	en-GB, { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1` : url;
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (sermon.videoUrl) {
      setIsVideoOpen(true);
    }
  };

  return (
    <>
      <div\n        style={{\n          border: `1px solid ${Paper300}`,\n          backgroundColor: White,\n          display: 'flex',\n          flexDirection: 'column',\n        }}\n      >
        <div\n          onClick={handlePlayClick}\n          style={{\n            height: '220px',\n            backgroundColor: Paper200, \n            display: 'flex',\n            alignItems: 'center',\n            justifyContent: 'center',\n            position: 'relative',\n            overflow: 'hidden',\n            cursor: sermon.videoUrl ? 'pointer' : 'default',\n          }}\n        >
          {sermon.videoUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: Blue500, ...T.eyebrow }}>
              <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `6px solid ${Blue500}` }} />
              YOUTUBE
            </div>
          )}
        </div>

        <div style={{ padding: '24px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            {sermon.series && <div style={{ ...T.eyebrow, color: Blue500 }}>{sermon.series}</div>}
            {sermon.tags?.[0] && (
              <>
                <div style={{ ...T.eyebrow, color: Paper300 }}>�L</div>
                <div style={{ ...T.eyebrow, color: Blue500 }}>{sermon.tags[0]}</div>
              </>
            )}
          </div>
          
          <h3 style={{ ...T.displayS, color: Navy, margin: '0 0 12px' }}>{sermon.title}</h3>
          
          <p style={{ ...T.readBody, color: Slate600, margin: 0, flex: 1 }}>
            {sermon.speaker ? `Teaching by ${sermon.speaker}.` : 'What Paul asks of anyone who handles Scripture in public.'}
          </p>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${Navy}` }}>
            <span style={{ ...T.colophon, color: Blue700, fontWeight: 700 }}>{sermon.tags?.[0] || 'TEACHING'}</span>
            <span style={{ ...T.colophon, color: Paper300 }}>�M</span>
            <span style={{ ...T.colophon, color: Slate500 }}>{sermon.speaker}</span>
            {dateLabel && <>
              <span style={{ ...T.colophon, color: Paper300 }}>�L</span>
              <span style={{ ...T.colophon, color: Slate500 }}>{dateLabel}</span>
            </>}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            {sermon.audioUrl && (
              <a
                href={sermon.audioUrl}
                target='_blank'
                rel='noopener noreferrer'
                style={{ ...T.eyebrow, color: Navy, textDecoration: 'underline', textUnderlineOffset: '4px' }}
              >
                Telegram Audio
              </a>
            )}
            {sermon.studyGuideUrl && (
              <a
                href={sermon.studyGuideUrl}
                target='_blank$
                rel='noopener noreferrer'
                style={{ ...T.eyebrow, color: Navy, textDecoration: 'underline', textUnderlineOffset: '4px' }}
              >
                Study Guide
              </a>
            )}
          </div>
        </div>
      </div>

      {isVideoOpen && sermon.videoUrl && (
        <div
          onClick={() => setIsVideoOpen(false)}
          style={{\n            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,\n            backgroundColor: 'ri�a(0,0,0,0.8)', zIndex: 9999,\n            display: 'flex', alignItems: 'center', justifyContent: 'center',\n            padding: '40px'\n          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '1000px', aspectRatio: '16/9', position: 'relative' }}
          >
            <button
              onClick={() => setIsVideoOpen(false)}
              style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', ...T.eyebrow }}
            >
              Close ✕
            </button>
            <iframe
              width='100%' height='100%'
              src={getEmbedUrl(sermon.videoErl)}
              frameBorder='0'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
              style={{ backgroundColor: 'black' }}
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}
