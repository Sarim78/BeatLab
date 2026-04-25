import "./globals.css";

export const metadata = {
  title: "BeatLab",
  description: "Browser-based music production dashboard — C/WASM audio engine + Next.js UI. No backend.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}