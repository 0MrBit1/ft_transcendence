import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CreateTestAccounts = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Ready to create test accounts");
  const [done, setDone] = useState(false);

  const createAccounts = async () => {
    setStatus("Creating test user...");
    try {
      // Create test user
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: "testuser@test.com",
        password: "testuser123",
      });
      if (userError && !userError.message.includes("already registered")) throw userError;

      if (userData?.user) {
        await supabase.from("profiles").insert({ user_id: userData.user.id, full_name: "Test User" });
        await supabase.from("user_roles").insert({ user_id: userData.user.id, role: "user" });
      }
      await supabase.auth.signOut();

      setStatus("Creating test org...");
      const { data: orgData, error: orgError } = await supabase.auth.signUp({
        email: "testorg@test.com",
        password: "testorg123",
      });
      if (orgError && !orgError.message.includes("already registered")) throw orgError;

      if (orgData?.user) {
        await supabase.from("organizations").insert({
          user_id: orgData.user.id,
          name: "Test Organization",
          description: "A test organization for demo purposes",
        });
        await supabase.from("user_roles").insert({ user_id: orgData.user.id, role: "organization" });
      }
      await supabase.auth.signOut();

      setStatus("Creating admin account...");
      const { data: adminData, error: adminError } = await supabase.auth.signUp({
        email: "admin@uniclubs.com",
        password: "admin123",
      });
      if (adminError && !adminError.message.includes("already registered")) throw adminError;

      if (adminData?.user) {
        await supabase.from("profiles").insert({ user_id: adminData.user.id, full_name: "Admin" });
        await supabase.from("user_roles").insert({ user_id: adminData.user.id, role: "admin" });
      }
      await supabase.auth.signOut();

      setStatus("All test accounts created!");
      setDone(true);
      toast.success("Test accounts created successfully!");
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-xl font-bold font-heading">Setup Test Accounts</h1>
        <p className="text-sm text-muted-foreground">{status}</p>
        {!done ? (
          <Button onClick={createAccounts} variant="default">Create Test Accounts</Button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">testuser@test.com / testuser123</p>
            <p className="text-xs text-muted-foreground">testorg@test.com / testorg123</p>
            <p className="text-xs text-muted-foreground">admin@uniclubs.com / admin123</p>
            <Button onClick={() => navigate("/login")} variant="default">Go to Login</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTestAccounts;
