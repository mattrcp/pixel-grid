import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixel Grid — SVG Generator",
  description: "Internal SVG pixel grid generator for Pixel & Rice Studio",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
