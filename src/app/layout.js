import "./globals.css";
import { siteConfig } from "@/config/siteConfig";

export const metadata = {
  title: siteConfig.meta.title,
  description: siteConfig.meta.description,
  icons: {
    icon: siteConfig.meta.icon,
    shortcut: siteConfig.meta.icon,
    apple: siteConfig.meta.icon,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
