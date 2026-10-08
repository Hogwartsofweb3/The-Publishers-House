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
