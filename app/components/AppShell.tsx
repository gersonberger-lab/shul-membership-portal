"use client";

import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/members", label: "Members" },
  { href: "/diary", label: "Diary" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell top-shell">
      <header className="site-header">
        <a className="brand-card top-brand" href="/">
          <div className="brand-mark">SP</div>
          <div>
            <div className="logo">Shul Portal</div>
            <div className="brand-subtitle">Membership and donations</div>
          </div>
        </a>

        <nav className="top-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={isActive(pathname, item.href) ? "active" : ""}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a className="button compact" href="/members/new">
          Add Member
        </a>
      </header>

      <main className="main-area top-main">{children}</main>
    </div>
  );
}
