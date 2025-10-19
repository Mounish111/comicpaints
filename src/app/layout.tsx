import "../styles/global.css";

export const metadata = {
  title: "Mural 3D",
  description: "3D wall mural studio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
