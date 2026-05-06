import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shul Membership Portal",
  description: "Membership, charges, payments and statements",
};

const navItems = [
  { href: "/", label: "Dashboard", icon: "◫" },
  { href: "/members", label: "Members", icon: "👥" },
  { href: "/members/new", label: "Add Member", icon: "＋" },
  { href: "/charges/new", label: "Add Charge", icon: "£" },
  { href: "/payments/new", label: "Add Payment", icon: "£" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="logo">Shul Portal</div>

            <nav className="nav">
              {navItems.map((item) => (
                <a key={item.href} href={item.href}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <main className="main-area">{children}</main>
        </div>
      </body>
    </html>
  );
}
