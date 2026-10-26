"use client";

import { useEffect } from "react";

export default function AboutScrollHandler() {
  useEffect(() => {
    const handleScrollToTarget = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash || "";

      if (
        hash.includes("beliefs") ||
        hash.includes("OUR%20BELIEFS") ||
        hash.includes("text=") ||
        hash.includes("hold")
      ) {
        const scrollToTarget = () => {
          const el = document.getElementById("beliefs");
          if (!el) return;

          const navbarHeight = 85;
          const rect = el.getBoundingClientRect();
          const targetY = rect.top + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: targetY,
            behavior: "smooth",
          });

          // Visual highlight glow pulse
          el.style.transition = "background-color 0.8s ease";
          el.style.backgroundColor = "#E6EFFF";
          setTimeout(() => {
            el.style.backgroundColor = "#F4F6FB";
          }, 2400);
        };

        // Trigger immediately, and repeat after 200ms and 600ms to handle any delayed layout shifts
        scrollToTarget();
        const t1 = setTimeout(scrollToTarget, 200);
        const t2 = setTimeout(scrollToTarget, 600);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    };

    // Run on initial mount
    handleScrollToTarget();

    // Also listen to hash changes
    window.addEventListener("hashchange", handleScrollToTarget);
    return () => window.removeEventListener("hashchange", handleScrollToTarget);
  }, []);

  return null;
}
