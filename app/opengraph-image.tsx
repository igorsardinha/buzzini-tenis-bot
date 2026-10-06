import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Buzzini Shoe Coach - Qual tênis usar hoje?";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 50% 25%, rgba(234, 88, 12, 0.25) 0%, transparent 65%)",
          fontFamily: "sans-serif",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Glow border badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "rgba(234, 88, 12, 0.15)",
            border: "1px solid rgba(249, 115, 22, 0.4)",
            borderRadius: "9999px",
            padding: "8px 22px",
            marginBottom: "30px",
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "9999px",
              backgroundColor: "#22c55e",
            }}
          />
          <span
            style={{
              color: "#fb923c",
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Buzzini Assessoria Esportiva
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <span
            style={{
              fontSize: "68px",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-2px",
              lineHeight: 1.1,
            }}
          >
            Buzzini Shoe Coach 👟
          </span>
          <span
            style={{
              fontSize: "44px",
              fontWeight: 800,
              background: "linear-gradient(90deg, #ea580c, #f59e0b)",
              backgroundClip: "text",
              color: "transparent",
              marginTop: "8px",
            }}
          >
            Qual tênis calçar no seu treino hoje?
          </span>
        </div>

        {/* Subtitle / Description */}
        <p
          style={{
            fontSize: "26px",
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.4,
            margin: "0 0 36px 0",
          }}
        >
          Indicação personalizada entre os seus tênis do armário & recomendações
          especialistas para compra de novos modelos.
        </p>

        {/* Features Chips */}
        <div
          style={{
            display: "flex",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              color: "#e4e4e7",
              fontSize: "18px",
              fontWeight: 600,
              padding: "10px 20px",
              borderRadius: "14px",
              display: "flex",
            }}
          >
            🏃‍♂️ Rodagens, Tiros & Longões
          </div>
          <div
            style={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              color: "#e4e4e7",
              fontSize: "18px",
              fontWeight: 600,
              padding: "10px 20px",
              borderRadius: "14px",
              display: "flex",
            }}
          >
            ⚡ Biomecânica & Placas de Carbono
          </div>
          <div
            style={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              color: "#e4e4e7",
              fontSize: "18px",
              fontWeight: 600,
              padding: "10px 20px",
              borderRadius: "14px",
              display: "flex",
            }}
          >
            🛒 Recomendações de Compra
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
