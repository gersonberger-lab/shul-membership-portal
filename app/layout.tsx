import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shul Membership Portal",
  description: "Membership, donations and statements portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
