/**
 * Top-level portal loading UI (covers /portal/login and the shell itself
 * before auth resolves).
 */
export default function PortalRootLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#F4F6FB",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "#0E1556",
          }}
        />
        <div
          style={{
            height: "12px",
            width: "120px",
            borderRadius: "6px",
            background:
              "linear-gradient(90deg, #e8edfb 25%, #d5dcf2 50%, #e8edfb 75%)",
            backgroundSize: "400px 100%",
            animation: "shimmer 1.4s ease-in-out infinite",
          }}
        />
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: 200px 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
