import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CalendarDays, MapPin, Users, ArrowLeft, Building2, Lock, Globe, UserPlus, Check, Loader2, Clock } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  end_date: string | null;
  event_type: string;
  max_attendees: number | null;
  tags: string[] | null;
  is_private: boolean;
  organization_id: string;
  organizations: { name: string; description: string | null } | null;
}

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    const { data } = await supabase
      .from("events")
      .select("*, organizations(name, description)")
      .eq("id", id!)
      .single();

    if (data) {
      setEvent(data as unknown as EventDetail);
      const { count } = await supabase
        .from("event_rsvps")
        .select("*", { count: "exact", head: true })
        .eq("event_id", id!)
        .eq("status", "approved");
      setRsvpCount(count || 0);

      if (user) {
        const { data: rsvp } = await supabase
          .from("event_rsvps")
          .select("status")
          .eq("event_id", id!)
          .eq("user_id", user.id)
          .maybeSingle();
        setRsvpStatus(rsvp?.status || null);
      }
    }
    setLoading(false);
  };

  const handleBook = async () => {
    if (!user) { navigate("/login"); return; }
    setActionLoading(true);
    const { error } = await supabase.from("event_rsvps").insert({ event_id: id!, user_id: user.id });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Booking request sent!");
      setRsvpStatus("pending");
    }
    setActionLoading(false);
  };

  const handleCancel = async () => {
    setActionLoading(true);
    const { error } = await supabase.from("event_rsvps").delete().eq("event_id", id!).eq("user_id", user!.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Booking cancelled");
      setRsvpStatus(null);
      if (rsvpStatus === "approved") setRsvpCount((c) => Math.max(c - 1, 0));
    }
    setActionLoading(false);
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

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
      concert: "🎵", conference: "🎤", workshop: "🛠", networking: "🤝", festival: "🎉", general: "📅",
    };
    return emojis[type] || emojis.general;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-muted-foreground text-sm">Event not found</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate("/events")}>
            ← Back to events
          </Button>
        </div>
      </div>
    );
  }

  const isFull = event.max_attendees ? rsvpCount >= event.max_attendees : false;
  const spotsLeft = event.max_attendees ? event.max_attendees - rsvpCount : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Back */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <button
              onClick={() => navigate("/events")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Event thumbnail */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-6"
              style={{ backgroundColor: getEventColor(event.event_type) }}
            >
              {getEventEmoji(event.event_type)}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-[1.15] mb-2">
              {event.title}
            </h1>

            {/* Hosted by */}
            <p className="text-sm text-muted-foreground mb-6">
              Hosted by <span className="font-medium text-foreground">{event.organizations?.name || "Unknown"}</span>
            </p>

            {/* Details list */}
            <div className="space-y-4 mb-8 py-6 border-y border-border">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-4.5 h-4.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{formatDate(event.event_date)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(event.event_date)}
                    {event.end_date ? ` to ${formatTime(event.end_date)}` : ""}
                  </p>
                </div>
              </div>
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4.5 h-4.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{event.location}</p>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Users className="w-4.5 h-4.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    {rsvpCount} registered
                    {event.max_attendees && <span className="text-muted-foreground font-normal"> / {event.max_attendees} spots</span>}
                  </p>
                  {spotsLeft !== null && (
                    <p className={`text-xs ${isFull ? "text-destructive" : "text-muted-foreground"}`}>
                      {isFull ? "Event is full" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} remaining`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {event.is_private ? (
                  <>
                    <Lock className="w-4.5 h-4.5 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground">Private event</p>
                  </>
                ) : (
                  <>
                    <Globe className="w-4.5 h-4.5 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground">Public event</p>
                  </>
                )}
              </div>
            </div>

            {/* Availability bar */}
            {spotsLeft !== null && (
              <div className="mb-8">
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((rsvpCount / event.max_attendees!) * 100, 100)}%`,
                      backgroundColor: isFull ? "hsl(0 84% 60%)" : "hsl(var(--accent))",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-2">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {event.tags.map((tag) => (
                  <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="pt-6 border-t border-border">
              {rsvpStatus === "approved" ? (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <Check className="w-4 h-4" /> You're registered
                  </span>
                  <Button variant="outline" size="sm" onClick={handleCancel} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel"}
                  </Button>
                </div>
              ) : rsvpStatus === "pending" ? (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-amber-600">
                    <Clock className="w-4 h-4" /> Pending approval
                  </span>
                  <Button variant="outline" size="sm" onClick={handleCancel} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Withdraw"}
                  </Button>
                </div>
              ) : rsvpStatus === "rejected" ? (
                <p className="text-sm text-destructive font-medium">Your request was declined</p>
              ) : (
                <Button size="lg" onClick={handleBook} disabled={actionLoading || isFull} className="w-full">
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFull ? "Event Full" : (
                    <><UserPlus className="w-4 h-4" /> Register</>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetailsPage;
