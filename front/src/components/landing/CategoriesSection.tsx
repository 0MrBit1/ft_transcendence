"use client";

import { motion } from "framer-motion";
import { Music, Code, Dumbbell, Palette, UtensilsCrossed, Handshake, Sparkles, GraduationCap, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

const categories = [
  { icon: Code, label: "Tech", eventType: "conference" },
  { icon: UtensilsCrossed, label: "Food & Drink", eventType: "festival" },
  { icon: Music, label: "Music", eventType: "concert" },
  { icon: Palette, label: "Arts & Culture", eventType: "workshop" },
  { icon: Heart, label: "Wellness", eventType: "general" },
  { icon: Dumbbell, label: "Sports", eventType: "general" },
  { icon: Handshake, label: "Networking", eventType: "networking" },
  { icon: GraduationCap, label: "Education", eventType: "workshop" },
  { icon: Sparkles, label: "Other", eventType: "general" },
];

const CategoriesSection = () => {
  const router = useRouter();

  return (
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl font-semibold tracking-tight mb-6"
        >
          Browse by Category
        </motion.h2>

        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => router.push(`/events?category=${cat.eventType}`)}
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors duration-200 text-left group"
            >
              <cat.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
