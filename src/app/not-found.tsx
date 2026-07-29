import Link from "next/link";

/** Global 404 for paths outside the locale segment. */
export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={{
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          margin: 0,
          background: "#fff",
          color: "#0f172a",
        }}
      >
        <h1 style={{ fontSize: 48, margin: 0 }}>404</h1>
        <p style={{ color: "#64748b" }}>This page could not be found.</p>
        <Link href="/en" style={{ color: "#4f46e5", marginTop: 12 }}>
          Go home
        </Link>
      </body>
    </html>
  );
}
