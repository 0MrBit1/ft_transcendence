import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <button
          onClick={() => navigate("/")}
          className="text-sm font-extrabold tracking-tight cursor-pointer"
        >
          UniClubs
        </button>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`text-sm transition-colors ${
                isActive(link.path)
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate("/signup")}>
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
            <button
              key={link.path}
              onClick={() => { navigate(link.path); setMobileOpen(false); }}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(link.path)
                  ? "text-foreground font-medium bg-muted"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-border flex gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}>Dashboard</Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={signOut}>Log out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigate("/login"); setMobileOpen(false); }}>Sign In</Button>
                <Button variant="default" size="sm" className="flex-1" onClick={() => { navigate("/signup"); setMobileOpen(false); }}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
