export interface AuthorAvatarInfo {
  type: "image" | "initials";
  src?: string;
  initials?: string;
}

export function getAuthorAvatar(authorName: string): AuthorAvatarInfo {
  const name = (authorName || "").toLowerCase().trim();
  
  if (name.includes("ngbede")) {
    return { type: "image", src: "/images/Pastor Ngbede Odeh.jpg" };
  }
  if (name.includes("joshua")) {
    return { type: "image", src: "/images/Rev. Joshua Agunbiade.jpg" };
  }
  if (name.includes("boniface")) {
    return { type: "image", src: "/images/Pastor Boniface Onah.jpg" };
  }
  if (name.includes("damilare")) {
    return { type: "image", src: "/images/Pastor Damilare Ayodele.jpg" };
  }
  if (name.includes("theophilus")) {
    return { type: "image", src: "/images/Pastor Theophilus Makinde.jpg" };
  }

  // Generate 1 or 2 letter initials
  const clean = authorName.replace(/&/g, " ").replace(/editorialtphjos/i, "TPH").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "TPH";
  return { type: "initials", initials };
}

/**
 * Standardize and deduplicate author names across the website,
 * solving casing, typo, and inverted first/last name issues.
 */
export function normalizeAuthor(raw?: string | null): string {
  if (!raw) return "The Publishers House";
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  // Co-authored with Tovshima Nguevese
  if (lower.includes("tovshima") || (lower.includes("nguevese") && (lower.includes("ngbede") || lower.includes("publisher")))) {
    return "Pastor Ngbede Odeh & Tovshima Nguevese";
  }
  // Pastor Ngbede Odeh
  if (lower.includes("ngbede") || lower.includes("ngbedethepublisher")) {
    return "Pastor Ngbede Odeh";
  }
  // Jemima Ogoyi (and Jemimah)
  if (lower.includes("jemima") || lower.includes("jemimah")) {
    return "Jemima Ogoyi";
  }
  // Idongesit Etokimo (and Etokimo Idongesit)
  if (lower.includes("etokimo") || lower.includes("idongesit")) {
    return "Idongesit Etokimo";
  }
  // Ibukun Oyewole (and Oyewole Precious Ibukunoluwa)
  if (lower.includes("ibukun") || lower.includes("oyewole")) {
    return "Ibukun Oyewole";
  }
  // Chinaza Jasmine Nnadi
  if (lower.includes("chinaza")) {
    return "Chinaza Jasmine Nnadi";
  }
  // Mowaninuola Umarudeen
  if (lower.includes("mowaninuola") || lower.includes("umarudeen")) {
    return "Mowaninuola Umarudeen";
  }
  // Joy Boro
  if (lower.includes("boro") || lower.includes("joy boro")) {
    return "Joy Boro";
  }
  // Akeju Joel
  if (lower.includes("akeju")) {
    return "Akeju Joel";
  }
  // Wisdom Chiezugo
  if (lower.includes("chiezugo") || lower.includes("wisdom")) {
    return "Wisdom Chiezugo";
  }
  // Joshua Agunbiade
  if (lower.includes("joshua") || lower.includes("agunbiade")) {
    return "Dr. Joshua Agunbiade";
  }
  // Damilare Ayodele
  if (lower.includes("damilare") || lower.includes("ayodele")) {
    return "Pastor Damilare Ayodele";
  }
  // Boniface Onah
  if (lower.includes("boniface") || lower.includes("onah")) {
    return "Pastor Boniface Onah";
  }
  // Theophilus Makinde
  if (lower.includes("theophilus") || lower.includes("makinde")) {
    return "Pastor Theophilus Makinde";
  }
  // Editorial / TPH
  if (lower.includes("editorial") || lower.includes("publishers house")) {
    return "The Publishers House";
  }

  // Fallback: title-case words
  return trimmed
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
