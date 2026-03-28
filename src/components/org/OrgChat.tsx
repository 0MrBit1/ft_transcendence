import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
}

interface OrgChatProps {
  orgId: string;
}

const OrgChat = ({ orgId }: OrgChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`org-chat-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `organization_id=eq.${orgId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, msg]);
          // Fetch profile if unknown
          if (!profileMap[msg.user_id]) {
            supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", msg.user_id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setProfileMap((prev) => ({ ...prev, [msg.user_id]: data.full_name }));
                }
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
      // Fetch all unique user profiles
      const userIds = [...new Set(data.map((m) => m.user_id))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);
        if (profiles) {
          const map: Record<string, string> = {};
          profiles.forEach((p) => { map[p.user_id] = p.full_name; });
          setProfileMap(map);
        }
      }
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending) return;
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      organization_id: orgId,
      user_id: user.id,
      message: newMessage.trim(),
    });
    if (!error) {
      setNewMessage("");
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getName = (userId: string) => profileMap[userId] || "Member";
  const isMe = (userId: string) => userId === user?.id;

  return (
    <div className="flex flex-col h-[500px] bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold font-heading">Organization Chat</h3>
        <p className="text-xs text-muted-foreground">Private to organization members</p>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No messages yet. Start the conversation!
            </p>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
              className={`flex ${isMe(msg.user_id) ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                  isMe(msg.user_id)
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {!isMe(msg.user_id) && (
                  <p className="text-[10px] font-semibold opacity-70 mb-0.5">
                    {getName(msg.user_id)}
                  </p>
                )}
                <p className="text-sm leading-relaxed">{msg.message}</p>
                <p className={`text-[10px] mt-1 ${isMe(msg.user_id) ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border flex gap-2">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={sending || !newMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default OrgChat;
