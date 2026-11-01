const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/GlobalAudioPlayer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The problem: after the closing </div> of the Spotify embed wrapper (line 560),
// there are stale leftover lines (561-632) that contain:
//   </div>        <- extra close of a div that no longer exists
//   {/* Artwork overlay */}
//   <div> ... artwork overlay block ... </div>
//   </div>        <- extra close
// These are remnants of the old YouTube audio makeshift.
// The correct structure should be:
//   <div padding="8px"> (Spotify embed wrapper)
//     <iframe ... />
//   </div>
// Followed immediately by ") : (" for the native audio fallback.

// Find the exact stale block and remove it.
// The stale block starts right after the spotify iframe wrapper closing </div>
// and ends just before ") : ("

const staleBlock = `                </div>

                  {/* Artwork overlay */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: "46px",
                      background: "linear-gradient(160deg, #0D1238 0%, #151A54 100%)",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 16px",
                      pointerEvents: "none",
                    }}
                  >
                    <img
                      src={thumbnailUrl}
                      alt={sermon.title}
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        flexShrink: 0,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-poppins)",
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "#FFFFFF",
                          lineHeight: "1.3em",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          marginBottom: "4px",
                        }}
                      >
                        {sermon.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)" }}>
                        {sermon.speaker || "Dr. Joshua Agunbiade"}
                      </div>
                      {sermon.series && (
                        <div style={{ fontSize: "10px", color: "#2090FF", marginTop: "2px", fontWeight: 600 }}>
                          {sermon.series}
                        </div>
                      )}
                    </div>
                    {/* Sound wave visual indicator */}
                    <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
                      {[14, 22, 18, 26, 16, 20].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            width: "3px",
                            height: \`\${h}px\`,
                            borderRadius: "2px",
                            backgroundColor: "#2090FF",
                            opacity: 0.8,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>`;

if (content.includes(staleBlock)) {
  content = content.replace(staleBlock, '                </div>');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: Removed stale artwork overlay block from GlobalAudioPlayer.tsx');
} else {
  // Try with CRLF
  const staleCRLF = staleBlock.replace(/\n/g, '\r\n');
  if (content.includes(staleCRLF)) {
    content = content.replace(staleCRLF, '                </div>');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('SUCCESS (CRLF): Removed stale artwork overlay block from GlobalAudioPlayer.tsx');
  } else {
    console.log('Block not found - will try line-number based approach');
    
    // Read file as lines and remove lines 561-633 (0-indexed: 560-632)
    const lines = content.split('\n');
    console.log('Total lines:', lines.length);
    console.log('Lines around 558-565:');
    for (let i = 558; i <= 640 && i < lines.length; i++) {
      console.log(`Line ${i+1}: ${JSON.stringify(lines[i])}`);
    }
  }
}
