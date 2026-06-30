import "./globals.css";

export const metadata = {
  title: "My Special Day! - Graduation Invitation",
  description: "A beautiful, magical anime-style graduation invitation section featuring a cute chibi graduate girl under a Shinkai-inspired sky.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
