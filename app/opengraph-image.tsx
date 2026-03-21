import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "dealwise -- Know your real rate before you sign";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#FAFBFE",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "4px",
            backgroundColor: "#4F46E5",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 700, color: "#111827" }}>
            dealwise
          </div>
          <div style={{ fontSize: 28, color: "#6B7280", marginTop: 12 }}>
            Know your real rate before you sign
          </div>
          <div style={{ fontSize: 18, color: "#9CA3AF", marginTop: 20 }}>
            AI-powered freelance contract analysis - Free - 30 seconds
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
