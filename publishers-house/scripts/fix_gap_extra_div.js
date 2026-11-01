const fs = require('fs');

const filePath = "c:\\Users\\Micha\\.gemini\\antigravity\\scratch\\The Publishers House\\publishers-house\\src\\components\\GlobalAudioPlayer.tsx";
let content = fs.readFileSync(filePath, 'utf8');

// From diagnostic:
// Line 560: "                </div>"
// Line 561: "                  </div>"   <- STALE, must be removed
// Line 562: "              ) : ("
// (no blank line between them)

const bad  = '                </div>\n                  </div>\n              ) : (';
const good = '                </div>\n              ) : (';

if (content.includes(bad)) {
  content = content.replace(bad, good);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: Removed extra stale </div>');
} else {
  // Try with \r
  const badR  = '                </div>\r\n                  </div>\r\n              ) : (';
  const goodR = '                </div>\r\n              ) : (';
  if (content.includes(badR)) {
    content = content.replace(badR, goodR);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('SUCCESS (CRLF): Removed extra stale </div>');
  } else {
    // Use line-index based surgery
    const lines = content.split('\n');
    // Find the stale line
    for (let i = 555; i <= 565; i++) {
      if (lines[i] && lines[i].trimEnd() === '                  </div>' && 
          lines[i-1] && lines[i-1].trimEnd() === '                </div>') {
        console.log(`Found stale line at index ${i} (line ${i+1}): ${JSON.stringify(lines[i])}`);
        lines.splice(i, 1);
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log('SUCCESS (line splice): Removed stale </div>');
        break;
      }
    }
  }
}
