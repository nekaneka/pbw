import { ImageResponse } from "next/og";

// Branded Open Graph / social preview image, generated as a real PNG so it
// renders on every platform. Text is kept umlaut-free for the default font.
export const alt = "Pflegeberatung Wien – Gutachten und Case Management";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CHIPS = ["DGKP", "13 Jahre Erfahrung", "Pflegegeldbegutachter", "Vor Ort in Wien"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#123f3a",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 4,
              color: "#cdae70",
              fontWeight: 700,
            }}
          >
            PFLEGEBERATUNG IN WIEN
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 88,
              lineHeight: 1.05,
              color: "#faf7f2",
              fontWeight: 700,
            }}
          >
            Pflegeberatung Wien
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 12,
              fontSize: 46,
              color: "#dcebe6",
            }}
          >
            Gutachten &amp; Case Management
          </div>
          <div style={{ display: "flex", width: 140, height: 6, background: "#cdae70", marginTop: 32 }} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {CHIPS.map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                fontSize: 28,
                color: "#0e332f",
                background: "#e3f1ec",
                borderRadius: 999,
                padding: "12px 28px",
                fontWeight: 700,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
