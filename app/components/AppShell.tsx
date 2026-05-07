"use client";

import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "D" },
  { href: "/members", label: "Members", icon: "M" },
  { href: "/members/new", label: "Add Member", icon: "+" },
  { href: "/charges/new", label: "Add Charge", icon: "C" },
  { href: "/payments/new", label: "Add Payment", icon: "P" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/members") return pathname === "/members" || pathname.startsWith("/members/");
  return pathname === href;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-card">
          <div className="brand-mark">SP</div>
          <div>
            <div className="logo">Shul Portal</div>
            <div className="brand-subtitle">Membership and donations</div>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={isActive(pathname, item.href) ? "active" : ""}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div>
            <span className="eyebrow">Shul management</span>
            <h2>Membership Portal</h2>
          </div>
          <a className="button secondary compact" href="/members">View Members</a>
        </header>

        <main className="main-area">{children}</main>
      </div>
    </div>
  );
}
