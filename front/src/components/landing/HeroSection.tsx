"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const router = useRouter();

  return (
    <section className="min-h-[80vh] flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-muted-foreground text-sm font-medium mb-4"
          >
            UniClubs
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-foreground"
          >
            Delightful events{" "}
            <span className="text-primary">start here.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-muted-foreground text-lg mt-6 max-w-md leading-relaxed"
          >
            Set up an event page, invite friends and manage bookings. Host a memorable event at your university.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            <Button
              size="lg"
              onClick={() => router.push("/events")}
              className="text-base px-8"
            >
              Explore Events
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
