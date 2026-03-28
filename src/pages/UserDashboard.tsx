import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CalendarDays, MapPin, Users, Clock, UserPlus, UserMinus,
  Lock, Building2, Search, MessageCircle, Globe,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import OrgChat from "@/components/org/OrgChat";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  event_type: string;
  tags: string[];
  organization_id: string;
  is_private: boolean;
  max_attendees: number | null;
}

interface Org {
  id: string;
  name: string;
  description: string | null;
}

interface Membership {
  organization_id: string;
  joined_at: string;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [allOrgs, setAllOrgs] = useState<Org[]>([]);
  const [orgMap, setOrgMap] = useState<Record<string, Org>>({});
  const [myOrgIds, setMyOrgIds] = useState<Set<string>>(new Set());
  const [myRsvps, setMyRsvps] = useState<Record<string, string>>({}); // eventId -> status
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);
  const [joinOrgLoading, setJoinOrgLoading] = useState<string | null>(null);
  const [orgSearch, setOrgSearch] = useState("");
  const [chatOrgId, setChatOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [eventsRes, orgsRes, membershipsRes, rsvpsRes, allRsvpsRes] = await Promise.all([
      supabase.from("events").select("*").order("event_date", { ascending: true }),
      supabase.from("organizations").select("id, name, description").eq("approval_status", "approved"),
      supabase.from("organization_members").select("organization_id, joined_at").eq("user_id", user!.id),
      supabase.from("event_rsvps").select("event_id, status").eq("user_id", user!.id),
      supabase.from("event_rsvps").select("event_id").eq("status", "approved"),
    ]);

    const orgs = (orgsRes.data || []) as Org[];
    const map: Record<string, Org> = {};
    orgs.forEach((o) => (map[o.id] = o));
    setAllOrgs(orgs);
    setOrgMap(map);

    const memberOrgIds = new Set((membershipsRes.data || []).map((m: Membership) => m.organization_id));
    setMyOrgIds(memberOrgIds);

    // Filter events: public events + private events from user's orgs
    if (eventsRes.data) {
      const visible = (eventsRes.data as Event[]).filter(
        (e) => !e.is_private || memberOrgIds.has(e.organization_id)
      );
      setEvents(visible);
    }

    if (rsvpsRes.data) {
      const rMap: Record<string, string> = {};
      rsvpsRes.data.forEach((r: any) => { rMap[r.event_id] = r.status; });
      setMyRsvps(rMap);
    }

    if (allRsvpsRes.data) {
      const counts: Record<string, number> = {};
      allRsvpsRes.data.forEach((r: any) => { counts[r.event_id] = (counts[r.event_id] || 0) + 1; });
      setRsvpCounts(counts);
    }

    setLoading(false);
  };

  const handleApply = async (eventId: string) => {
    setRsvpLoading(eventId);
    const { error } = await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: user!.id });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Application sent! Waiting for approval.");
      setMyRsvps((prev) => ({ ...prev, [eventId]: "pending" }));
    }
    setRsvpLoading(null);
  };

  const handleWithdraw = async (eventId: string) => {
    setRsvpLoading(eventId);
    const { error } = await supabase.from("event_rsvps").delete().eq("event_id", eventId).eq("user_id", user!.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Application withdrawn");
      setMyRsvps((prev) => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
      setRsvpCounts((prev) => ({ ...prev, [eventId]: Math.max((prev[eventId] || 1) - 1, 0) }));
    }
    setRsvpLoading(null);
  };

  const handleJoinOrg = async (orgId: string) => {
    setJoinOrgLoading(orgId);
    const { error } = await supabase.from("organization_members").insert({ organization_id: orgId, user_id: user!.id });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Joined organization!");
      setMyOrgIds((prev) => new Set([...prev, orgId]));
    }
    setJoinOrgLoading(null);
  };

  const handleLeaveOrg = async (orgId: string) => {
    setJoinOrgLoading(orgId);
    const { error } = await supabase.from("organization_members").delete().eq("organization_id", orgId).eq("user_id", user!.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Left organization");
      setMyOrgIds((prev) => { const n = new Set(prev); n.delete(orgId); return n; });
      setChatOrgId(null);
    }
    setJoinOrgLoading(null);
  };

  const myOrgs = allOrgs.filter((o) => myOrgIds.has(o.id));
  const filteredOrgs = allOrgs.filter((o) =>
    o.name.toLowerCase().includes(orgSearch.toLowerCase()) ||
    (o.description || "").toLowerCase().includes(orgSearch.toLowerCase())
  );
  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= new Date());

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Chat overlay
  if (chatOrgId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-24 max-w-3xl">
          <Button variant="ghost" size="sm" onClick={() => setChatOrgId(null)} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h2 className="text-lg font-bold font-heading mb-4">
            {orgMap[chatOrgId]?.name} — Chat
          </h2>
          <OrgChat orgId={chatOrgId} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-heading">Your Dashboard</h1>
          <p className="text-muted-foreground text-sm">Events, organizations & more</p>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="events" className="gap-1.5">
              <CalendarDays className="w-4 h-4" /> Events
            </TabsTrigger>
            <TabsTrigger value="my-orgs" className="gap-1.5">
              <Building2 className="w-4 h-4" /> My Orgs ({myOrgs.length})
            </TabsTrigger>
            <TabsTrigger value="explore" className="gap-1.5">
              <Globe className="w-4 h-4" /> Explore Orgs
            </TabsTrigger>
          </TabsList>

          {/* EVENTS TAB */}
          <TabsContent value="events">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No upcoming events available</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingEvents.map((event, i) => {
                  const rsvpStatus = myRsvps[event.id];
                  const count = rsvpCounts[event.id] || 0;
                  const isFull = event.max_attendees ? count >= event.max_attendees : false;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-card rounded-xl border border-border p-5 flex flex-col"
                      style={{ boxShadow: "var(--shadow-card)" }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold font-heading">{event.title}</h3>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-[10px] shrink-0">{event.event_type}</Badge>
                          {event.is_private && (
                            <Badge variant="outline" className="text-[10px] gap-0.5">
                              <Lock className="w-2.5 h-2.5" />Private
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {event.description || "No description"}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(event.event_date).toLocaleDateString(undefined, {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {orgMap[event.organization_id]?.name || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserPlus className="w-3 h-3" />
                          {count}{event.max_attendees ? `/${event.max_attendees}` : ""} joined
                        </span>
                      </div>
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {event.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto pt-4">
                        {rsvpStatus === "approved" ? (
                          <Button variant="outline" size="sm" className="w-full" disabled={rsvpLoading === event.id} onClick={() => handleWithdraw(event.id)}>
                            <UserMinus className="w-3.5 h-3.5 mr-1" />
                            {rsvpLoading === event.id ? "..." : "Leave Event"}
                          </Button>
                        ) : rsvpStatus === "pending" ? (
                          <Button variant="outline" size="sm" className="w-full" disabled={rsvpLoading === event.id} onClick={() => handleWithdraw(event.id)}>
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {rsvpLoading === event.id ? "..." : "Pending — Withdraw"}
                          </Button>
                        ) : rsvpStatus === "rejected" ? (
                          <Button variant="outline" size="sm" className="w-full opacity-60" disabled>
                            Application Rejected
                          </Button>
                        ) : (
                          <Button variant="default" size="sm" className="w-full" disabled={rsvpLoading === event.id || isFull} onClick={() => handleApply(event.id)}>
                            <UserPlus className="w-3.5 h-3.5 mr-1" />
                            {isFull ? "Full" : rsvpLoading === event.id ? "..." : "Apply to Join"}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* MY ORGS TAB */}
          <TabsContent value="my-orgs">
            {myOrgs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>You haven't joined any organizations yet. Explore and join one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myOrgs.map((org, i) => (
                  <motion.div
                    key={org.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/org/${org.id}`)}
                    className="bg-card rounded-xl border border-border p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{org.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{org.description || "No description"}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">View →</Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* EXPLORE ORGS TAB */}
          <TabsContent value="explore">
            <div className="mb-4 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {filteredOrgs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No organizations found</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredOrgs.map((org, i) => {
                  const isMember = myOrgIds.has(org.id);
                  return (
                    <motion.div
                      key={org.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-card rounded-xl border border-border p-5"
                      style={{ boxShadow: "var(--shadow-card)" }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{org.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{org.description || "No description"}</p>
                        </div>
                      </div>
                      {isMember ? (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleLeaveOrg(org.id)} disabled={joinOrgLoading === org.id}>
                          {joinOrgLoading === org.id ? "..." : "Joined ✓ — Leave"}
                        </Button>
                      ) : (
                        <Button variant="default" size="sm" className="w-full" onClick={() => handleJoinOrg(org.id)} disabled={joinOrgLoading === org.id}>
                          <UserPlus className="w-3.5 h-3.5 mr-1" />
                          {joinOrgLoading === org.id ? "..." : "Join Organization"}
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserDashboard;
