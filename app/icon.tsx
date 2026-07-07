import { ImageResponse } from "next/og";

// Favicon: petrol tile with a paper-white "P". Generated as PNG.
export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#123f3a",
          color: "#faf7f2",
          fontSize: 34,
          fontWeight: 700,
          fontFamily: "serif",
          borderRadius: 10,
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
