import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import { User } from "lucide-react";

const SignupUser = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
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
        // Insert profile and role
        await supabase.from("profiles").insert({
          user_id: data.user.id,
          full_name: fullName.trim(),
        });
        await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: "user",
        });
        toast.success("Account created! Check your email to confirm.");
        navigate("/login");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
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
            <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-7 h-7 text-secondary" />
            </div>
            <h1 className="text-2xl font-bold font-heading">Sign up as User</h1>
            <p className="text-muted-foreground text-sm mt-1">Join the campus community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" variant="default" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Want to register an organization?{" "}
            <a href="/signup/organization" className="text-secondary font-medium hover:underline">Sign up as Org</a>
            {" · "}
            <a href="/login" className="text-secondary font-medium hover:underline">Log in</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupUser;
