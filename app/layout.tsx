import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="logo">Shul Portal</div>
            <nav className="nav">
              <a href="/">Dashboard</a>
              <a href="/members">Members</a>
              <a href="/members/new">Add Member</a>
              <a href="/charges/new">Add Charge</a>
              <a href="/payments/new">Add Payment</a>
            </nav>
          </aside>

          <main className="main-area">{children}</main>
        </div>
      </body>
    </html>
  );
}
