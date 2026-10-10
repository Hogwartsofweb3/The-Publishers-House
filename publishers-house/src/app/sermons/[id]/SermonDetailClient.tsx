"use client";

import React, { useState, useEffect } from "react";
import type { Sermon } from "@/lib/firebase";
import Link from "next/link";
import SermonCard from "@/components/SermonCard";
import { useAudio } from "@/components/GlobalAudioPlayer";

// COLOR TOKENS
const Navy = "#151A54";
const Blue700 = "#0140C1";
const Blue500 = "#2090FF";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const Paper100 = "#F4F6FB";
const Cream = "#F7F5F0";
const White = "#FFFFFF";
const Orange = "#E8740C";
const Gold = "#B8860B";

function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

interface Props {
  sermon: Sermon;
  relatedSermons: Sermon[];
}

export default function SermonDetailClient({ sermon, relatedSermons }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);
  const { playSermon } = useAudio();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const videoId = getYouTubeVideoId(sermon.videoUrl);
  const coverImageUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  const formattedDate = sermon.date ? new Date(sermon.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : "";

  const handlePlayAudio = () => {
    if (!sermon.audioUrl) return;
    if (sermon.audioUrl.includes('t.me') || sermon.audioUrl.includes('spotify.com')) {
      window.open(sermon.audioUrl, '_blank');
    } else {
      playSermon(sermon);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: sermon.title,
        text: `Listen to ${sermon.title} by ${sermon.speaker}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <main style={{ paddingTop: '70px', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: White, fontFamily: "'Poppins', sans-serif" }}>
      {/* HEADER SECTION */}
      <section style={{ backgroundColor: Cream, padding: isMobile ? '40px 20px' : '80px 5%' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: '40px',
          alignItems: isMobile ? 'center' : 'flex-start'
        }}>
          {/* Left Column */}
          <div style={{ flexShrink: 0 }}>
            {coverImageUrl ? (
              <img 
                src={coverImageUrl} 
                alt={sermon.title} 
                style={{
                  width: isMobile ? '100%' : '320px',
                  maxWidth: '320px',
                  height: isMobile ? 'auto' : '320px',
                  aspectRatio: '1/1',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            ) : (
              <div style={{
                width: isMobile ? '100%' : '320px',
                maxWidth: '320px',
                height: isMobile ? '320px' : '320px',
                backgroundColor: Navy,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <span style={{ fontSize: '48px' }}>🎵</span>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: isMobile ? 'center' : 'left' }}>
            <span style={{ color: Gold, fontWeight: 600, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
              SERMON
            </span>
            <h1 style={{ 
              fontFamily: "'Playfair Display', serif", 
              color: '#1A1A2E', 
              fontSize: 'clamp(28px, 4vw, 42px)',
              margin: '0 0 16px 0',
              lineHeight: 1.2
            }}>
              {sermon.title}
            </h1>
            <p style={{ 
              color: Slate600, 
              fontSize: '16px',
              margin: '0 0 32px 0'
            }}>
              {sermon.speaker} {formattedDate && `| ${formattedDate}`}
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              {sermon.videoUrl && (
                <button 
                  onClick={() => { setShowVideoPlayer(true); setIsVideoMinimized(false); }}
                  style={{
                    backgroundColor: Navy,
                    color: White,
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '15px'
                  }}
                >
                  <span>▶</span> Watch
                </button>
              )}
              {sermon.audioUrl && (
                <button 
                  onClick={handlePlayAudio}
                  style={{
                    backgroundColor: Orange,
                    color: White,
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '15px'
                  }}
                >
                  <span>🔊</span> Play Audio
                </button>
              )}
              <button 
                onClick={handleShare}
                style={{
                  backgroundColor: 'transparent',
                  color: Navy,
                  border: `1px solid ${Slate500}`,
                  padding: '12px 24px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '15px'
                }}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BODY SECTION */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 5%', flex: 1 }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: '60px',
          alignItems: 'flex-start'
        }}>
          {/* Left Metadata Panel */}
          <div style={{ 
            width: isMobile ? '100%' : '280px', 
            flexShrink: 0,
            position: isMobile ? 'static' : 'sticky',
            top: '40px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {sermon.series && (
                <div>
                  <div style={{ fontWeight: 600, color: '#1A1A2E', marginBottom: '4px' }}>Series:</div>
                  <Link href={`/sermons?series=${encodeURIComponent(sermon.series)}`} style={{ color: Blue500, textDecoration: 'none' }}>
                    {sermon.series}
                  </Link>
                </div>
              )}
              {sermon.speaker && (
                <div>
                  <div style={{ fontWeight: 600, color: '#1A1A2E', marginBottom: '4px' }}>Speaker:</div>
                  <div style={{ color: Slate600 }}>{sermon.speaker}</div>
                </div>
              )}
              {sermon.duration && (
                <div>
                  <div style={{ fontWeight: 600, color: '#1A1A2E', marginBottom: '4px' }}>Duration:</div>
                  <div style={{ color: Slate600 }}>{sermon.duration}</div>
                </div>
              )}
              {sermon.scripture && (
                <div>
                  <div style={{ fontWeight: 600, color: '#1A1A2E', marginBottom: '4px' }}>Scripture:</div>
                  <div style={{ color: Slate600 }}>{sermon.scripture}</div>
                </div>
              )}
              {sermon.tags && sermon.tags.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, color: '#1A1A2E', marginBottom: '4px' }}>Tags:</div>
                  <div style={{ color: Slate600 }}>{sermon.tags.join(", ")}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ 
              fontFamily: "'Playfair Display', serif", 
              color: '#1A1A2E',
              fontSize: '28px',
              borderBottom: `2px solid ${Paper100}`,
              paddingBottom: '16px',
              margin: '0 0 24px 0'
            }}>
              Overview
            </h2>
            <div style={{ 
              color: '#333333', 
              fontSize: '17px', 
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap'
            }}>
              {sermon.summary || `Teaching by ${sermon.speaker}.`}
            </div>
          </div>
        </div>
      </section>

      {/* RELATED SERMONS SECTION */}
      {relatedSermons && relatedSermons.length > 0 && (
        <section style={{ backgroundColor: Paper100, padding: isMobile ? '40px 20px' : '60px 5%' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ 
              fontFamily: "'Playfair Display', serif", 
              color: Navy,
              fontSize: '28px',
              textAlign: 'center',
              margin: '0 0 40px 0'
            }}>
              {sermon.series && relatedSermons.some(r => r.series === sermon.series)
                ? `More from: ${sermon.series}`
                : "More Teachings"}
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '280px' : '320px'}, 1fr))`,
              gap: '24px' 
            }}>
              {relatedSermons.slice(0, 3).map(related => (
                <SermonCard key={related.id} sermon={related} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FLOATING MINI-PLAYER */}
      {showVideoPlayer && videoId && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? '12px' : '24px',
          right: isMobile ? '12px' : '24px',
          width: isMobile ? 'calc(100% - 24px)' : '380px',
          backgroundColor: '#22272E',
          borderRadius: '12px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
          zIndex: 1000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #333'
        }}>
          {/* Title Bar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#1C2128',
            borderBottom: isVideoMinimized ? 'none' : '1px solid #333'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <span style={{ color: '#fff', fontSize: '14px' }}>▶</span>
              <span style={{ 
                color: '#fff', 
                fontSize: '14px', 
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {sermon.title}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => setIsVideoMinimized(!isVideoMinimized)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#aaa',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={isVideoMinimized ? "Expand" : "Minimize"}
              >
                {isVideoMinimized ? '□' : '—'}
              </button>
              <button 
                onClick={() => { setShowVideoPlayer(false); setIsVideoMinimized(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#aaa',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Video Area */}
          {!isVideoMinimized && (
            <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000' }}>
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={sermon.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
