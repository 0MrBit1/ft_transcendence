"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Navbar } from "@/components/landing";
import { LogIn, TestTube } from "lucide-react";

const TEST_ACCOUNTS = [
  { label: "Test User", email: "testuser@test.com", password: "testuser123", description: "View user dashboard" },
  { label: "Test Org", email: "testorg@test.com", password: "testorg123", description: "View org dashboard" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        const role = roles?.[0]?.role;
        if (role === "organization") {
          router.push("/dashboard/org");
        } else {
          router.push("/dashboard");
        }
      }
      toast.success("Welcome back!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Invalid credentials";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    await handleLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-7 h-7 text-secondary" />
            </div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Log in to your Uniclubs account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" variant="default" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <div className="mt-6 bg-muted/50 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-3">
              <TestTube className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Test Login</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TEST_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  variant="outline"
                  size="sm"
                  className="flex flex-col items-start h-auto py-2 px-3"
                  disabled={loading}
                  onClick={() => handleLogin(account.email, account.password)}
                >
                  <span className="font-medium text-xs">{account.label}</span>
                  <span className="text-[10px] text-muted-foreground">{account.description}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-muted-foreground">Don&apos;t have an account?</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push("/signup/user")}>
                Sign up as User
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/signup/organization")}>
                Sign up as Org
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
