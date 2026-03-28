"use client";

import { motion } from "framer-motion";
import { Users, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/landing";
import Link from "next/link";

export default function SignupChoicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Join Uniclubs
            </h1>
            <p className="text-muted-foreground">
              How would you like to sign up?
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/signup/user")}
              className="group p-8 rounded-xl bg-card border-2 border-border hover:border-secondary transition-all duration-300 text-left cursor-pointer shadow-sm"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-5 group-hover:bg-secondary/20 transition-colors">
                <User className="w-7 h-7 text-secondary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Sign up as User</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Discover events, join organizations, and stay connected with your campus community.
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/signup/organization")}
              className="group p-8 rounded-xl bg-card border-2 border-border hover:border-accent transition-all duration-300 text-left cursor-pointer shadow-sm"
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                <Users className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-xl font-bold mb-2">Sign up as Organization</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Create and manage events, grow your club, and engage with members on campus.
              </p>
            </motion.button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-secondary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
