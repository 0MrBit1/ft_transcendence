"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar, Footer } from "@/components/landing";
import { motion } from "framer-motion";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  event_type: string;
  max_attendees: number | null;
  tags: string[] | null;
  is_private: boolean;
  organizations: { name: string } | null;
}

const CATEGORIES = ["all", "concert", "conference", "workshop", "networking", "festival", "general"];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState("date");
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("id, title, description, location, event_date, event_type, max_attendees, tags, is_private, organizations(name)")
      .eq("is_private", false)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true });
    setEvents((data as unknown as EventItem[]) || []);
    setLoading(false);
  };

  const filtered = events
    .filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        (e.description || "").toLowerCase().includes(q) ||
        (e.location || "").toLowerCase().includes(q) ||
        (e.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesCat = category === "all" || e.event_type === category;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
      return a.title.localeCompare(b.title);
    });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = d.toDateString() === now.toDateString();
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    if (isToday) return `Today, ${time}`;
    if (isTomorrow) return `Tomorrow, ${time}`;
    return `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}, ${time}`;
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      concert: "hsl(340 40% 92%)",
      conference: "hsl(220 40% 92%)",
      workshop: "hsl(160 40% 92%)",
      networking: "hsl(30 40% 92%)",
      festival: "hsl(280 40% 92%)",
      general: "hsl(0 0% 93%)",
    };
    return colors[type] || colors.general;
  };

  const getEventEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      concert: "🎵",
      conference: "🎤",
      workshop: "🛠",
      networking: "🤝",
      festival: "🎉",
      general: "📅",
    };
    return emojis[type] || emojis.general;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight">Discover Events</h1>
            <p className="text-muted-foreground mt-1">
              Explore popular events near you, browse by category, or search for something specific.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c === "all" ? "All Categories" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="name">By Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""} found
          </p>

          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <div className="w-14 h-14 rounded-xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-52 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm font-medium">No events match your search</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-x-6">
              {filtered.map((event, i) => (
                <motion.button
                  key={event.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-muted/50 transition-colors duration-200 text-left group"
                >
                  <div
                    className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-xl"
                    style={{ backgroundColor: getEventColor(event.event_type) }}
                  >
                    {getEventEmoji(event.event_type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{formatDate(event.event_date)}</p>
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate mt-0.5">
                      {event.title}
                    </h3>
                    {(event.organizations?.name || event.location) && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {event.organizations?.name}
                        {event.organizations?.name && event.location && " · "}
                        {event.location}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors shrink-0" />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
