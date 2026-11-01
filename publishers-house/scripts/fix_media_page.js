const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/portal/(protected)/member/media/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The problem: after line 123 (closing of handleResume function),
// there are stray duplicate lines 124-132 that are a leftover fragment:
//           videoUrl: item.videoUrl,
//           audioUrl: item.audioUrl,
//           type: item.type,
//           resourceSlug: item.resourceSlug,
//         },
//         0
//       );
//     }
//   };
// These need to be removed entirely.

// Try LF version first
const strayLF = `    }\n  };\n          videoUrl: item.videoUrl,\n          audioUrl: item.audioUrl,\n          type: item.type,\n          resourceSlug: item.resourceSlug,\n        },\n        0\n      );\n    }\n  };`;
const cleanLF = `    }\n  };`;

// Try CRLF version
const strayCRLF = strayLF.replace(/\n/g, '\r\n');
const cleanCRLF = cleanLF.replace(/\n/g, '\r\n');

if (content.includes(strayLF)) {
  content = content.replace(strayLF, cleanLF);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS (LF): Removed stray duplicate lines from media/page.tsx');
} else if (content.includes(strayCRLF)) {
  content = content.replace(strayCRLF, cleanCRLF);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS (CRLF): Removed stray duplicate lines from media/page.tsx');
} else {
  // Line-number fallback — show lines around 120-135
  const lines = content.split('\n');
  console.log('Pattern not found. Lines 118-135:');
  for (let i = 118; i <= 135 && i < lines.length; i++) {
    console.log(`Line ${i+1}: ${JSON.stringify(lines[i])}`);
  }
}
