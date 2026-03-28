"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PublicEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  event_type: string;
  max_attendees: number | null;
  tags: string[] | null;
  organizations: { name: string } | null;
}

const FeaturedEvents = () => {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, description, location, event_date, event_type, max_attendees, tags, organizations(name)")
        .eq("is_private", false)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(6);
      setEvents((data as unknown as PublicEvent[]) || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

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
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Popular Events</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Upcoming near you</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-sm gap-1.5"
            onClick={() => router.push("/events")}
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="w-14 h-14 rounded-xl bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-16 border border-dashed border-border rounded-xl"
          >
            <p className="text-muted-foreground text-sm">No upcoming events yet</p>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-x-8">
            {events.map((event, i) => (
              <motion.button
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEvents;
