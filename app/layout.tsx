import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Northwest Frozen Shipping Documents", description: "Shipping document management for Northwest Frozen LLC." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
