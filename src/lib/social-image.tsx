export const socialImageAlt =
  "ResumeATS social preview showing ATS score analysis, keyword intelligence, and AI-powered resume tools";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export function SocialImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top left, rgba(34,211,238,0.22), transparent 35%), radial-gradient(circle at bottom right, rgba(139,92,246,0.24), transparent 38%), linear-gradient(135deg, #050816 0%, #091321 50%, #120b22 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 36,
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
          boxShadow: "0 24px 80px rgba(2, 6, 23, 0.45)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          padding: "52px 58px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 26,
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
                  color: "#020617",
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                R
              </div>
              <span>ResumeATS</span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontWeight: 800,
                fontSize: 64,
                letterSpacing: "-0.045em",
                lineHeight: 1.02,
              }}
            >
              <span>Free AI Resume Checker</span>
              <span style={{ color: "#c4b5fd" }}>Built for ATS + Recruiters</span>
            </div>

            <p
              style={{
                marginTop: 26,
                marginBottom: 0,
                maxWidth: 760,
                color: "#cbd5e1",
                fontSize: 28,
                lineHeight: 1.35,
              }}
            >
              Score your resume, find missing keywords, generate cover letters, and prep for interviews in one workflow.
            </p>
          </div>

          <div
            style={{
              width: 280,
              height: 320,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: 26,
              borderRadius: 26,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 18, color: "#94a3b8" }}>ATS Score</span>
              <span
                style={{
                  fontSize: 16,
                  color: "#86efac",
                  background: "rgba(34,197,94,0.14)",
                  borderRadius: 999,
                  padding: "6px 10px",
                }}
              >
                A Grade
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 92, fontWeight: 800, letterSpacing: "-0.06em" }}>91</span>
              <span style={{ fontSize: 22, color: "#cbd5e1" }}>Matched keywords, readability, and formatting checks</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Synonym-aware keyword matching",
                "Recruiter readability scoring",
                "Free cover letter + interview prep",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, color: "#e2e8f0" }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
                    }}
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["No account required", "Unlimited free checks", "ATS-ready templates"].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e2e8f0",
                fontSize: 20,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
