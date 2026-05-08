"use client";

import { usePathname } from "next/navigation";

const navItems = [
  { href: "/members", label: "Members" },
  { href: "/charges/batch", label: "Charges" },
  { href: "/payments/new", label: "Payments" },
  { href: "/diary", label: "Diary" },
  { href: "/settings", label: "Settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/charges/batch") return pathname.startsWith("/charges");
  if (href === "/payments/new") return pathname.startsWith("/payments");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isPortal(pathname: string) {
  return pathname === "/portal" || pathname.startsWith("/portal/");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <div className="auth-shell">{children}</div>;
  }

  if (pathname === "/portal/login" || isPortal(pathname)) {
    return <div className="member-portal-shell">{children}</div>;
  }

  return (
    <div className="app-shell top-shell">
      <header className="site-header simple-header">
        <a className="brand-card top-brand" href="/">
          <div className="brand-mark">SP</div>
          <div>
            <div className="logo">Shul Portal</div>
            <div className="brand-subtitle">Membership and accounts</div>
          </div>
        </a>

        <nav className="top-nav">
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
      </header>

      <main className="main-area top-main">{children}</main>
    </div>
  );
}
