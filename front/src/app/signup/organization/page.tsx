"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Navbar } from "@/components/landing";
import { Users } from "lucide-react";
import Link from "next/link";

export default function SignupOrganizationPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from("organizations").insert({
          user_id: data.user.id,
          name: orgName.trim(),
          description: description.trim() || null,
        });
        await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: "organization",
        });
        toast.success("Organization registered! Check your email to confirm.");
        router.push("/login");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-accent" />
            </div>
            <h1 className="text-2xl font-bold">Sign up as Organization</h1>
            <p className="text-muted-foreground text-sm mt-1">Create and manage campus events</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name *</Label>
              <Input id="orgName" placeholder="Chess Club" value={orgName} onChange={(e) => setOrgName(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Tell students what your organization is about..." value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="club@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" variant="default" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register Organization"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Just a student?{" "}
            <Link href="/signup/user" className="text-secondary font-medium hover:underline">Sign up as User</Link>
            {" · "}
            <Link href="/login" className="text-secondary font-medium hover:underline">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
