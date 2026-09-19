import "./globals.css";

export const metadata = {
  title: "My Special Day! - Graduation Invitation 🎓",
  description: "Thiệp mời tham dự Lễ Tốt Nghiệp Đại học Tôn Đức Thắng",
  icons: {
    icon: '/assets/graduation-symbol.png',
    shortcut: '/assets/graduation-symbol.png',
    apple: '/assets/graduation-symbol.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
