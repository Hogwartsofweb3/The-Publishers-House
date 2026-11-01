const fs = require('fs');

const filePath = "c:\\Users\\Micha\\.gemini\\antigravity\\scratch\\The Publishers House\\publishers-house\\src\\components\\HomeContent.tsx";
let content = fs.readFileSync(filePath, 'utf8');

const isCRLF = content.includes('\r\n');
const NL = isCRLF ? '\r\n' : '\n';
console.log('Line ending:', isCRLF ? 'CRLF' : 'LF');

// ── FIX 1: HomeGatheringCard — wrap outer <div> in <a> ──────────────────────
// The card's return starts at:
//   return (
//     <div
//       style={{
//         backgroundColor: White,
//         border: `1px solid ${Paper300}`,
//         borderRadius: "4px",
//         overflow: "hidden",
//         display: "flex",
//         flexDirection: "column",
//         boxShadow: "0 2px 10px rgba(21, 26, 84, 0.03)",
//         transition: "box-shadow 200ms ease, transform 200ms ease",
//       }}
//     >
// We replace this opening with an <a> wrapper

const oldCardOpen = [
  '  return (',
  '    <div',
  '      style={{',
  '        backgroundColor: White,',
  '        border: `1px solid ${Paper300}`,',
  '        borderRadius: "4px",',
  '        overflow: "hidden",',
  '        display: "flex",',
  '        flexDirection: "column",',
  '        boxShadow: "0 2px 10px rgba(21, 26, 84, 0.03)",',
  '        transition: "box-shadow 200ms ease, transform 200ms ease",',
  '      }}',
  '    >',
].join(NL);

const newCardOpen = [
  '  const ytUrl = ev.youtubeUrl || "https://www.youtube.com/@ThePublishersHouse";',
  '  return (',
  '    <a',
  '      href={ytUrl}',
  '      target="_blank"',
  '      rel="noopener noreferrer"',
  '      style={{',
  '        backgroundColor: White,',
  '        border: `1px solid ${Paper300}`,',
  '        borderRadius: "4px",',
  '        overflow: "hidden",',
  '        display: "flex",',
  '        flexDirection: "column",',
  '        boxShadow: "0 2px 10px rgba(21, 26, 84, 0.03)",',
  '        transition: "box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease",',
  '        textDecoration: "none",',
  '        color: "inherit",',
  '        cursor: "pointer",',
  '      }}',
  '      onMouseEnter={e => {',
  '        e.currentTarget.style.borderColor = "#FF0000";',
  '        e.currentTarget.style.boxShadow = "0 6px 24px rgba(255,0,0,0.12)";',
  '        e.currentTarget.style.transform = "translateY(-2px)";',
  '      }}',
  '      onMouseLeave={e => {',
  '        e.currentTarget.style.borderColor = Paper300;',
  '        e.currentTarget.style.boxShadow = "0 2px 10px rgba(21, 26, 84, 0.03)";',
  '        e.currentTarget.style.transform = "translateY(0)";',
  '      }}',
  '    >',
].join(NL);

// The card's closing is:
//       </div>
//     </div>
//   );
// }
// (the </div> for Card Content Area, then </div> for the outer card wrapper)
// We need to replace the last </div> with </a>

// Find the closing of HomeGatheringCard — it ends with:
//     </div>
//   );
// }
//
// /* ── Next Gatherings Dynamic Image Gallery ── */

const oldCardClose = [
  '      </div>',
  '    </div>',
  '  );',
  '}',
  '',
  '/* ── Next Gatherings Dynamic Image Gallery ── */',
].join(NL);

const newCardClose = [
  '      </div>',
  '    </a>',
  '  );',
  '}',
  '',
  '/* ── Next Gatherings Dynamic Image Gallery ── */',
].join(NL);

// ── FIX 2: HomeGatheringSingleFeature — add YouTube CTA button ──────────────
// In the single-feature card, there's already a buttons row with Register Now and All Events.
// We add a "Watch on YouTube" button next to them.

// The existing buttons div in the single feature:
const oldBtnsRow = [
  '          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>',
  '            {ev.registrationUrl && (',
  '              <a',
  '                href={ev.registrationUrl}',
  '                target="_blank"',
  '                rel="noopener noreferrer"',
  '                style={{',
  '                  ...T.button,',
  '                  padding: "10px 22px",',
  '                  borderRadius: "2px",',
  '                  backgroundColor: Blue700,',
  '                  color: White,',
  '                  textDecoration: "none",',
  '                  display: "inline-flex",',
  '                  alignItems: "center",',
  '                }}',
  '              >',
  '                Register Now →',
  '              </a>',
  '            )}',
  '            <Link',
  '              href="/schedule"',
  '              style={{',
  '                ...T.button,',
  '                padding: "9px 18px",',
  '                borderRadius: "2px",',
  '                border: `1px solid ${Paper300}`,',
  '                color: Navy,',
  '                textDecoration: "none",',
  '                display: "inline-flex",',
  '                alignItems: "center",',
  '              }}',
  '            >',
  '              All Events',
  '            </Link>',
  '          </div>',
].join(NL);

const newBtnsRow = [
  '          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>',
  '            {ev.registrationUrl && (',
  '              <a',
  '                href={ev.registrationUrl}',
  '                target="_blank"',
  '                rel="noopener noreferrer"',
  '                style={{',
  '                  ...T.button,',
  '                  padding: "10px 22px",',
  '                  borderRadius: "2px",',
  '                  backgroundColor: Blue700,',
  '                  color: White,',
  '                  textDecoration: "none",',
  '                  display: "inline-flex",',
  '                  alignItems: "center",',
  '                }}',
  '              >',
  '                Register Now →',
  '              </a>',
  '            )}',
  '            <a',
  '              href={ev.youtubeUrl || "https://www.youtube.com/@ThePublishersHouse"}',
  '              target="_blank"',
  '              rel="noopener noreferrer"',
  '              style={{',
  '                ...T.button,',
  '                padding: "9px 18px",',
  '                borderRadius: "2px",',
  '                backgroundColor: "#FF0000",',
  '                color: White,',
  '                textDecoration: "none",',
  '                display: "inline-flex",',
  '                alignItems: "center",',
  '                gap: "7px",',
  '              }}',
  '            >',
  '              <svg width="14" height="10" viewBox="0 0 24 17" fill="none">',
  '                <path d="M23.5 2.7a3 3 0 0 0-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.6A3 3 0 0 0 .5 2.7C0 4.6 0 8.5 0 8.5s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1C4.5 17 12 17 12 17s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 12.4 24 8.5 24 8.5s0-3.9-.5-5.8z" fill="#FF0000"/>',
  '                <path d="M9.5 12.1V4.9l6.3 3.6-6.3 3.6z" fill="#fff"/>',
  '              </svg>',
  '              Watch Live',
  '            </a>',
  '            <Link',
  '              href="/schedule"',
  '              style={{',
  '                ...T.button,',
  '                padding: "9px 18px",',
  '                borderRadius: "2px",',
  '                border: `1px solid ${Paper300}`,',
  '                color: Navy,',
  '                textDecoration: "none",',
  '                display: "inline-flex",',
  '                alignItems: "center",',
  '              }}',
  '            >',
  '              All Events',
  '            </Link>',
  '          </div>',
].join(NL);

// Apply all three replacements
let changed = 0;

if (content.includes(oldCardOpen)) {
  content = content.replace(oldCardOpen, newCardOpen);
  console.log('✓ Card opening <div> → <a>');
  changed++;
} else {
  console.log('✗ Card opening NOT FOUND');
  // Debug
  const idx = content.indexOf('transition: "box-shadow 200ms ease, transform 200ms ease",');
  console.log('  transition line at char:', idx);
  if (idx >= 0) console.log('  context:', JSON.stringify(content.slice(Math.max(0,idx-100), idx+120)));
}

if (content.includes(oldCardClose)) {
  content = content.replace(oldCardClose, newCardClose);
  console.log('✓ Card closing </div> → </a>');
  changed++;
} else {
  console.log('✗ Card closing NOT FOUND');
}

if (content.includes(oldBtnsRow)) {
  content = content.replace(oldBtnsRow, newBtnsRow);
  console.log('✓ Single-feature card: Watch Live button added');
  changed++;
} else {
  console.log('✗ Single-feature buttons row NOT FOUND');
}

if (changed > 0) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\nSaved. ${changed}/3 replacements applied.`);
} else {
  console.log('\nNo changes saved.');
}
