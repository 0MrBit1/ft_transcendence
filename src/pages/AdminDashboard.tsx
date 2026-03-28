import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Check, X, LogOut, Clock, Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface OrgRequest {
  id: string;
  name: string;
  description: string | null;
  approval_status: string;
  created_at: string;
  user_id: string;
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<OrgRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/admin");
      return;
    }
    // Verify admin role
    const checkAdmin = async () => {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = roles?.some((r) => r.role === "admin");
      if (!isAdmin) {
        navigate("/admin");
        return;
      }
      fetchOrgs();
    };
    checkAdmin();
  }, [user]);

  const fetchOrgs = async () => {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setOrgs(data as OrgRequest[]);
    setLoading(false);
  };

  const handleAction = async (orgId: string, status: "approved" | "rejected") => {
    setActionLoading(orgId);
    const { error } = await supabase
      .from("organizations")
      .update({ approval_status: status })
      .eq("id", orgId);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Organization ${status}`);
      setOrgs((prev) => prev.map((o) => (o.id === orgId ? { ...o, approval_status: status } : o)));
    }
    setActionLoading(null);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  const pending = orgs.filter((o) => o.approval_status === "pending");
  const approved = orgs.filter((o) => o.approval_status === "approved");
  const rejected = orgs.filter((o) => o.approval_status === "rejected");

  const statusColor = (status: string) => {
    if (status === "approved") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (status === "rejected") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-xl font-bold font-heading">Admin Panel</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Log out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pending", count: pending.length, icon: Clock, color: "text-amber-600" },
            { label: "Approved", count: approved.length, icon: Check, color: "text-emerald-600" },
            { label: "Rejected", count: rejected.length, icon: X, color: "text-red-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold font-heading">{stat.count}</p>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-bold font-heading mb-4">Organization Requests</h2>

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : orgs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No organization requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orgs.map((org, i) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-4"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold font-heading truncate">{org.name}</h3>
                    <Badge className={`text-[10px] ${statusColor(org.approval_status)}`}>
                      {org.approval_status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{org.description || "No description"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(org.created_at).toLocaleDateString()}
                  </p>
                </div>
                {org.approval_status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={actionLoading === org.id}
                      onClick={() => handleAction(org.id, "approved")}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      disabled={actionLoading === org.id}
                      onClick={() => handleAction(org.id, "rejected")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
