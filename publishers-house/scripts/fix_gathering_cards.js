const fs = require('fs');

const filePath = "c:\\Users\\Micha\\.gemini\\antigravity\\scratch\\The Publishers House\\publishers-house\\src\\components\\HomeSections.tsx";
let content = fs.readFileSync(filePath, 'utf8');

// Detect line ending
const isCRLF = content.includes('\r\n');
const NL = isCRLF ? '\r\n' : '\n';
console.log('Line ending:', isCRLF ? 'CRLF' : 'LF');

// The old event card block (div-based, no link)
const oldBlock = [
  '          {/* Event cards */}',
  '          <div className="tph-grid-auto" style={{ marginBottom: "40px" }}>',
  '            {gatherings.map((ev, i) => (',
  '              <div',
  '                key={i}',
  '                style={{',
  '                  backgroundColor: White, border: `1px solid ${Paper300}`,',
  '                  borderRadius: "4px", padding: "20px",',
  '                  display: "flex", flexDirection: "column", gap: "12px",',
  '                }}',
  '              >',
  '                {/* Date badge */}',
  '                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>',
  '                  <div style={{ textAlign: "center", minWidth: "44px" }}>',
  '                    <div style={{ ...T.label, color: Slate500, fontSize: "9px" }}>{ev.day}</div>',
  '                    <div style={{ ...T.displayM, color: Navy, fontSize: "28px" }}>{ev.date}</div>',
  '                    <div style={{ ...T.label, color: Slate500, fontSize: "9px" }}>{ev.month}</div>',
  '                  </div>',
  '                  <div>',
  '                    <h3 style={{ ...T.displayS, color: Navy, margin: 0, fontSize: "16px" }}>{ev.title}</h3>',
  '                    {ev.theme && (',
  '                      <div style={{ ...T.eyebrow, color: Blue500, marginTop: "4px" }}>{ev.theme}</div>',
  '                    )}',
  '                  </div>',
  '                </div>',
  '',
  '                <p style={{ ...T.readSmall, color: Slate600, margin: 0, flex: 1 }}>{ev.desc}</p>',
  '',
  '                {/* Colophon */}',
  '                <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "12px", borderTop: `1px solid ${Paper200}`, flexWrap: "wrap" }}>',
  '                  {ev.scripture && <>',
  '                    <span style={{ ...T.colophon, color: Blue700 }}>{ev.scripture}</span>',
  '                    <span style={{ ...T.colophon, color: Paper400 }}>·</span>',
  '                  </>}',
  '                  <span style={{ ...T.colophon, color: Slate500 }}>{ev.time}</span>',
  '                  <span style={{ ...T.colophon, color: Paper400 }}>·</span>',
  '                  <span style={{ ...T.colophon, color: Slate500 }}>{ev.city}</span>',
  '                </div>',
  '              </div>',
  '            ))}',
  '          </div>',
].join(NL);

const newBlock = [
  '          {/* Event cards — clicking opens TPH YouTube channel */}',
  '          <div className="tph-grid-auto" style={{ marginBottom: "40px" }}>',
  '            {gatherings.map((ev, i) => (',
  '              <a',
  '                key={i}',
  '                href={ev.youtubeUrl || "https://www.youtube.com/@ThePublishersHouse"}',
  '                target="_blank"',
  '                rel="noopener noreferrer"',
  '                style={{',
  '                  backgroundColor: White, border: `1px solid ${Paper300}`,',
  '                  borderRadius: "4px", padding: "20px",',
  '                  display: "flex", flexDirection: "column", gap: "12px",',
  '                  textDecoration: "none", color: "inherit",',
  '                  transition: "border-color 0.18s, box-shadow 0.18s, transform 0.18s",',
  '                  cursor: "pointer",',
  '                }}',
  '                onMouseEnter={e => {',
  '                  const el = e.currentTarget;',
  '                  el.style.borderColor = "#FF0000";',
  '                  el.style.boxShadow = "0 4px 24px rgba(255,0,0,0.10)";',
  '                  el.style.transform = "translateY(-2px)";',
  '                }}',
  '                onMouseLeave={e => {',
  '                  const el = e.currentTarget;',
  '                  el.style.borderColor = Paper300;',
  '                  el.style.boxShadow = "none";',
  '                  el.style.transform = "translateY(0)";',
  '                }}',
  '              >',
  '                {/* Date badge */}',
  '                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>',
  '                  <div style={{ textAlign: "center", minWidth: "44px" }}>',
  '                    <div style={{ ...T.label, color: Slate500, fontSize: "9px" }}>{ev.day}</div>',
  '                    <div style={{ ...T.displayM, color: Navy, fontSize: "28px" }}>{ev.date}</div>',
  '                    <div style={{ ...T.label, color: Slate500, fontSize: "9px" }}>{ev.month}</div>',
  '                  </div>',
  '                  <div>',
  '                    <h3 style={{ ...T.displayS, color: Navy, margin: 0, fontSize: "16px" }}>{ev.title}</h3>',
  '                    {ev.theme && (',
  '                      <div style={{ ...T.eyebrow, color: Blue500, marginTop: "4px" }}>{ev.theme}</div>',
  '                    )}',
  '                  </div>',
  '                </div>',
  '',
  '                <p style={{ ...T.readSmall, color: Slate600, margin: 0, flex: 1 }}>{ev.desc}</p>',
  '',
  '                {/* Colophon + YouTube CTA chip */}',
  '                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", paddingTop: "12px", borderTop: `1px solid ${Paper200}`, flexWrap: "wrap" }}>',
  '                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>',
  '                    {ev.scripture && <>',
  '                      <span style={{ ...T.colophon, color: Blue700 }}>{ev.scripture}</span>',
  '                      <span style={{ ...T.colophon, color: Paper400 }}>·</span>',
  '                    </>}',
  '                    <span style={{ ...T.colophon, color: Slate500 }}>{ev.time}</span>',
  '                    <span style={{ ...T.colophon, color: Paper400 }}>·</span>',
  '                    <span style={{ ...T.colophon, color: Slate500 }}>{ev.city}</span>',
  '                  </div>',
  '                  {/* YouTube "Watch Live" badge */}',
  '                  <span style={{',
  '                    display: "inline-flex", alignItems: "center", gap: "5px",',
  '                    padding: "3px 9px", borderRadius: "20px",',
  '                    backgroundColor: "rgba(255,0,0,0.07)",',
  '                    border: "1px solid rgba(255,0,0,0.20)",',
  '                    ...T.colophon, color: "#CC0000", fontSize: "9px", flexShrink: 0,',
  '                  }}>',
  '                    <svg width="11" height="8" viewBox="0 0 24 17" fill="none" xmlns="http://www.w3.org/2000/svg">',
  '                      <path d="M23.5 2.7a3 3 0 0 0-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.6A3 3 0 0 0 .5 2.7C0 4.6 0 8.5 0 8.5s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1C4.5 17 12 17 12 17s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 12.4 24 8.5 24 8.5s0-3.9-.5-5.8z" fill="#FF0000"/>',
  '                      <path d="M9.5 12.1V4.9l6.3 3.6-6.3 3.6z" fill="#fff"/>',
  '                    </svg>',
  '                    Watch Live',
  '                  </span>',
  '                </div>',
  '              </a>',
  '            ))}',
  '          </div>',
].join(NL);

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: Event cards now wrap with YouTube link.');
} else {
  // Partial diagnostic
  const marker = '          {/* Event cards */}';
  const idx = content.indexOf(marker);
  console.log('Old block not found. Marker index:', idx);
  if (idx >= 0) {
    console.log('Context around marker:');
    console.log(JSON.stringify(content.slice(idx, idx + 300)));
  }
}
