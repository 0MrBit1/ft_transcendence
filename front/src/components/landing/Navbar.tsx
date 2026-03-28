"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Discover", path: "/events" },
    ...(user
      ? [
          { label: "My Events", path: "/dashboard" },
          { label: "Organisations", path: "/dashboard/org" },
        ]
      : []),
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link
          href="/"
          className="text-sm font-extrabold tracking-tight cursor-pointer"
        >
          UniClubs
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-sm transition-colors ${
                isActive(link.path)
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                Sign In
              </Button>
              <Button variant="default" size="sm" onClick={() => router.push("/signup")}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(link.path)
                  ? "text-foreground font-medium bg-muted"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border flex gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => { router.push("/dashboard"); setMobileOpen(false); }}>Dashboard</Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={signOut}>Log out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => { router.push("/login"); setMobileOpen(false); }}>Sign In</Button>
                <Button variant="default" size="sm" className="flex-1" onClick={() => { router.push("/signup"); setMobileOpen(false); }}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
