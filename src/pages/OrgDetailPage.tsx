import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/landing/Navbar";
import OrgChat from "@/components/org/OrgChat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Users, CalendarDays, MapPin, Clock,
  ArrowLeft, UserPlus, UserMinus,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Org {
  id: string;
  name: string;
  description: string | null;
}

interface Member {
  id: string;
  user_id: string;
  joined_at: string;
  full_name: string;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  event_type: string;
  tags: string[] | null;
  is_private: boolean;
  max_attendees: number | null;
}

const OrgDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Org | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchAll();
  }, [id, user]);

  const fetchAll = async () => {
    if (!id) return;
    const [orgRes, membersRes, eventsRes] = await Promise.all([
      supabase.from("organizations").select("id, name, description").eq("id", id).single(),
      supabase.from("organization_members").select("id, user_id, joined_at").eq("organization_id", id).order("joined_at", { ascending: true }),
      supabase.from("events").select("*").eq("organization_id", id).order("event_date", { ascending: true }),
    ]);

    if (orgRes.data) setOrg(orgRes.data as Org);

    if (membersRes.data) {
      const userIds = membersRes.data.map((m: any) => m.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const pMap: Record<string, string> = {};
      profiles?.forEach((p: any) => { pMap[p.user_id] = p.full_name; });
      setMembers(membersRes.data.map((m: any) => ({ ...m, full_name: pMap[m.user_id] || "Member" })));
      if (user) setIsMember(userIds.includes(user.id));
    }

    if (eventsRes.data) {
      setEvents(eventsRes.data as Event[]);
      const eventIds = eventsRes.data.map((e: any) => e.id);
      if (eventIds.length > 0) {
        const { data: rsvps } = await supabase.from("event_rsvps").select("event_id").eq("status", "approved").in("event_id", eventIds);
        if (rsvps) {
          const counts: Record<string, number> = {};
          rsvps.forEach((r: any) => { counts[r.event_id] = (counts[r.event_id] || 0) + 1; });
          setRsvpCounts(counts);
        }
      }
    }

    setLoading(false);
  };

  const handleJoin = async () => {
    if (!user || !id) return;
    setJoinLoading(true);
    const { error } = await supabase.from("organization_members").insert({ organization_id: id, user_id: user.id });
    if (error) toast.error(error.message);
    else { toast.success("Joined!"); fetchAll(); }
    setJoinLoading(false);
  };

  const handleLeave = async () => {
    if (!user || !id) return;
    setJoinLoading(true);
    const { error } = await supabase.from("organization_members").delete().eq("organization_id", id).eq("user_id", user.id);
    if (error) toast.error(error.message);
    else { toast.success("Left organization"); fetchAll(); }
    setJoinLoading(false);
  };

  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= new Date());
  const pastEvents = events.filter((e) => new Date(e.event_date) < new Date());

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center text-muted-foreground">Organization not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold font-heading truncate">{org.name}</h1>
              <p className="text-sm text-muted-foreground">{org.description || "No description"}</p>
            </div>
            {user && (
              isMember ? (
                <Button variant="outline" size="sm" className="shrink-0" onClick={handleLeave} disabled={joinLoading}>
                  <UserMinus className="w-3.5 h-3.5 mr-1" />
                  {joinLoading ? "..." : "Leave"}
                </Button>
              ) : (
                <Button variant="default" size="sm" className="shrink-0" onClick={handleJoin} disabled={joinLoading}>
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  {joinLoading ? "..." : "Join"}
                </Button>
              )
            )}
          </div>
        </motion.div>

        {/* Two-column layout: left = events + members, right = chat */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column — Events & Members */}
          <div className="lg:col-span-3 space-y-10">
            {/* Upcoming Events */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Upcoming Events</h2>
                <Badge variant="secondary" className="text-[10px] ml-auto">{upcomingEvents.length}</Badge>
              </div>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No upcoming events</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((event, i) => (
                    <EventRow key={event.id} event={event} index={i} rsvpCount={rsvpCounts[event.id] || 0} onClick={() => navigate(`/events/${event.id}`)} />
                  ))}
                </div>
              )}

              {pastEvents.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Past</h3>
                  <div className="space-y-2 opacity-50">
                    {pastEvents.map((event, i) => (
                      <EventRow key={event.id} event={event} index={i} rsvpCount={rsvpCounts[event.id] || 0} onClick={() => navigate(`/events/${event.id}`)} />
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Members */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Members</h2>
                <Badge variant="secondary" className="text-[10px] ml-auto">{members.length}</Badge>
              </div>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No members yet</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {members.map((member, i) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-2.5 bg-card border border-border rounded-full pl-1 pr-4 py-1"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {member.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{member.full_name}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right column — Chat */}
          <div className="lg:col-span-2">
            {isMember ? (
              <div className="lg:sticky lg:top-24">
                <OrgChat orgId={org.id} />
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <Users className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">Join this organization to access the group chat</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const EventRow = ({ event, index, rsvpCount, onClick }: { event: Event; index: number; rsvpCount: number; onClick: () => void }) => {
  const d = new Date(event.event_date);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 cursor-pointer transition-colors group"
    >
      {/* Date block */}
      <div className="w-12 text-center shrink-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {d.toLocaleDateString(undefined, { month: "short" })}
        </p>
        <p className="text-xl font-bold font-heading leading-none">{d.getDate()}</p>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{event.title}</h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </span>
          {event.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3" />{event.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />{rsvpCount}{event.max_attendees ? `/${event.max_attendees}` : ""}
          </span>
        </div>
      </div>

      <Badge variant="secondary" className="text-[10px] shrink-0">{event.event_type}</Badge>
    </motion.div>
  );
};

export default OrgDetailPage;
