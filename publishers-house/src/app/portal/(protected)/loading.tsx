/**
 * Portal route-level loading UI.
 * Shows while the protected layout server-side auth is resolving,
 * and while any portal page chunk is being fetched.
 * This replaces the blank white flash that inflates LCP.
 */
export default function PortalLoading() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#F4F6FB",
      }}
    >
      {/* Sidebar skeleton */}
      <div
        style={{
          width: "264px",
          minHeight: "100vh",
          backgroundColor: "#0E1556",
          flexShrink: 0,
        }}
      />

      {/* Main content skeleton */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Topbar skeleton */}
        <div
          style={{
            height: "64px",
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #D5DCF2",
          }}
        />
        {/* Content area shimmer */}
        <div style={{ padding: "32px 40px" }}>
          <div
            style={{
              height: "32px",
              width: "280px",
              borderRadius: "8px",
              background:
                "linear-gradient(90deg, #e8edfb 25%, #d5dcf2 50%, #e8edfb 75%)",
              backgroundSize: "800px 100%",
              animation: "shimmer 1.4s ease-in-out infinite",
              marginBottom: "24px",
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
              marginBottom: "28px",
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: "100px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(90deg, #e8edfb 25%, #d5dcf2 50%, #e8edfb 75%)",
                  backgroundSize: "800px 100%",
                  animation: "shimmer 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <div
            style={{
              height: "320px",
              borderRadius: "14px",
              background:
                "linear-gradient(90deg, #e8edfb 25%, #d5dcf2 50%, #e8edfb 75%)",
              backgroundSize: "800px 100%",
              animation: "shimmer 1.4s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>
    </div>
  );
}
