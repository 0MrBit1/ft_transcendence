"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarDays, MapPin, Clock, Users, AlertCircle, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { Navbar } from "@/components/landing";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  end_date: string | null;
  event_type: string;
  tags: string[];
  is_private: boolean;
  max_attendees: number | null;
}

interface Org {
  id: string;
  name: string;
  description: string | null;
  approval_status: string;
}

interface Member {
  id: string;
  user_id: string;
  joined_at: string;
  profile?: { full_name: string };
}

interface PendingRsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at: string;
  event_title?: string;
  user_name?: string;
}

export default function OrgDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [org, setOrg] = useState<Org | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [pendingRsvps, setPendingRsvps] = useState<PendingRsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchOrg();
  }, [user, router]);

  const fetchOrg = async () => {
    if (!user) return;
    const { data } = await supabase.from("organizations").select("*").eq("user_id", user.id).single();
    if (data) {
      setOrg(data as Org);
      await Promise.all([fetchEvents(data.id), fetchMembers(data.id), fetchPendingRsvps(data.id)]);
    }
    setLoading(false);
  };

  const fetchEvents = async (orgId: string) => {
    const { data: evts } = await supabase.from("events").select("*").eq("organization_id", orgId).order("event_date", { ascending: false });
    if (evts) {
      setEvents(evts as Event[]);
      const { data: rsvps } = await supabase.from("event_rsvps").select("event_id").eq("status", "approved").in("event_id", evts.map(e => e.id));
      if (rsvps) {
        const counts: Record<string, number> = {};
        rsvps.forEach((r: { event_id: string }) => { counts[r.event_id] = (counts[r.event_id] || 0) + 1; });
        setRsvpCounts(counts);
      }
    }
  };

  const fetchMembers = async (orgId: string) => {
    const { data } = await supabase.from("organization_members").select("*").eq("organization_id", orgId).order("joined_at", { ascending: false });
    if (data) {
      const userIds = data.map((m: { user_id: string }) => m.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const profileMap: Record<string, string> = {};
      profiles?.forEach((p: { user_id: string; full_name: string }) => { profileMap[p.user_id] = p.full_name; });
      setMembers(data.map((m: { id: string; user_id: string; joined_at: string }) => ({
        ...m,
        profile: { full_name: profileMap[m.user_id] || "Unknown" }
      })));
    }
  };

  const fetchPendingRsvps = async (orgId: string) => {
    const { data: evts } = await supabase.from("events").select("id, title").eq("organization_id", orgId);
    if (!evts || evts.length === 0) return;

    const eventIds = evts.map((e: { id: string }) => e.id);
    const eventMap: Record<string, string> = {};
    evts.forEach((e: { id: string; title: string }) => { eventMap[e.id] = e.title; });

    const { data: rsvps } = await supabase.from("event_rsvps").select("*").eq("status", "pending").in("event_id", eventIds);
    if (rsvps && rsvps.length > 0) {
      const userIds = [...new Set(rsvps.map((r: { user_id: string }) => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const profileMap: Record<string, string> = {};
      profiles?.forEach((p: { user_id: string; full_name: string }) => { profileMap[p.user_id] = p.full_name; });

      setPendingRsvps(rsvps.map((r: { id: string; event_id: string; user_id: string; status: string; created_at: string }) => ({
        ...r,
        event_title: eventMap[r.event_id] || "Unknown Event",
        user_name: profileMap[r.user_id] || "Unknown User",
      })));
    }
  };

  const handleRsvpAction = async (rsvpId: string, status: "approved" | "rejected") => {
    setActionLoading(rsvpId);
    const { error } = await supabase.from("event_rsvps").update({ status }).eq("id", rsvpId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Request ${status}`);
      setPendingRsvps((prev) => prev.filter((r) => r.id !== rsvpId));
      if (status === "approved" && org) {
        fetchEvents(org.id);
      }
    }
    setActionLoading(null);
  };

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-24 text-center text-muted-foreground">Loading...</div></div>;

  const isApproved = org?.approval_status === "approved";
  const isPending = org?.approval_status === "pending";
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.event_date) < new Date());

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{org?.name || "Organization"}</h1>
            <p className="text-muted-foreground text-sm">{org?.description || "Manage your events"}</p>
            <Badge className={`mt-2 text-xs ${
              isApproved ? "bg-emerald-100 text-emerald-700" :
              isPending ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            }`}>
              {org?.approval_status || "unknown"}
            </Badge>
          </div>
        </div>

        {!isApproved && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Organization {isPending ? "Pending Approval" : "Rejected"}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isPending
                  ? "Your organization is awaiting admin approval. You'll be able to create events once approved."
                  : "Your organization request was rejected. Contact support for more info."}
              </p>
            </div>
          </div>
        )}

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="events" className="gap-1.5">
              <CalendarDays className="w-4 h-4" /> Events ({events.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5">
              <UserPlus className="w-4 h-4" /> Requests
              {pendingRsvps.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0">{pendingRsvps.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5">
              <Users className="w-4 h-4" /> Members ({members.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            {events.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>{isApproved ? "No events yet — create your first one!" : "Events will appear here once your org is approved"}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingEvents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Upcoming</h3>
                    <div className="space-y-3">
                      {upcomingEvents.map((event, i) => (
                        <EventCard key={event.id} event={event} index={i} rsvpCount={rsvpCounts[event.id] || 0} />
                      ))}
                    </div>
                  </div>
                )}
                {pastEvents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Past</h3>
                    <div className="space-y-3 opacity-70">
                      {pastEvents.map((event, i) => (
                        <EventCard key={event.id} event={event} index={i} rsvpCount={rsvpCounts[event.id] || 0} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests">
            {pendingRsvps.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No pending join requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRsvps.map((rsvp, i) => (
                  <motion.div
                    key={rsvp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border border-border p-4 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <p className="font-medium text-sm">{rsvp.user_name}</p>
                      <p className="text-xs text-muted-foreground">
                        wants to join <span className="font-medium text-foreground">{rsvp.event_title}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(rsvp.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={actionLoading === rsvp.id}
                        onClick={() => handleRsvpAction(rsvp.id, "approved")}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        {actionLoading === rsvp.id ? "..." : "Accept"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading === rsvp.id}
                        onClick={() => handleRsvpAction(rsvp.id, "rejected")}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="members">
            {members.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No members yet. Users can join your organization from the event pages.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border border-border p-4 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {member.profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.profile?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

const EventCard = ({ event, index, rsvpCount }: { event: Event; index: number; rsvpCount: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="bg-card rounded-xl border border-border p-4 shadow-sm"
  >
    <div className="flex items-start justify-between mb-2">
      <h3 className="font-semibold">{event.title}</h3>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-[10px]">{event.event_type}</Badge>
        {event.is_private && <Badge variant="outline" className="text-[10px]">Private</Badge>}
      </div>
    </div>
    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description || "No description"}</p>
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(event.event_date).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
      {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>}
      {event.max_attendees && <span className="flex items-center gap-1"><Users className="w-3 h-3" />Max {event.max_attendees}</span>}
      <span className="flex items-center gap-1"><UserPlus className="w-3 h-3" />{rsvpCount} joined</span>
    </div>
    {event.tags && event.tags.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-2">
        {event.tags.map((tag) => <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>)}
      </div>
    )}
  </motion.div>
);
