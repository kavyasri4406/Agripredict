"use client";
import DocumentOcr from "@/components/DocumentOcr";

export default function DocumentsPage() {
  return (
    <div className="page-content">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "Playfair Display, serif",
            fontSize: 26,
            fontWeight: 800,
            color: "var(--text)",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            📄 Document Scanner
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
            Upload government letters, scheme documents, or notices — get a plain-language summary in English, Tamil, or Telugu.
          </p>
        </div>
        <DocumentOcr />
      </div>
    </div>
  );
}
