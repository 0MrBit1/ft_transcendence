import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const EVENT_TYPES = ["general", "workshop", "social", "competition", "meeting", "seminar", "sports", "cultural"];

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  onEventCreated: (event: any) => void;
}

const CreateEventDialog = ({ open, onOpenChange, orgId, onEventCreated }: CreateEventDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventType, setEventType] = useState("general");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxAttendees, setMaxAttendees] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitle(""); setDescription(""); setLocation(""); setEventDate(""); setEndDate("");
    setEventType("general"); setTags([]); setTagInput(""); setIsPrivate(false); setMaxAttendees("");
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) {
      toast.error("Title and date are required");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase.from("events").insert({
      organization_id: orgId,
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      event_date: new Date(eventDate).toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
      event_type: eventType,
      tags,
      is_private: isPrivate,
      max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
    }).select().single();

    if (error) {
      toast.error(error.message);
    } else if (data) {
      toast.success("Event created!");
      onEventCreated(data);
      resetForm();
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Plus className="w-4 h-4 mr-1" /> New Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Create Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateEvent} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this event about?" rows={3} maxLength={1000} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Date & Time *</Label>
              <Input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date & Time</Label>
              <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room 101, Main Campus" maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label>Event Type</Label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEventType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    eventType === t
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : "bg-muted text-muted-foreground border-border hover:border-secondary/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag and press Enter"
                maxLength={30}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs gap-1">
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Max Attendees</Label>
              <Input type="number" min="1" value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} placeholder="Unlimited" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
              <Label className="text-sm">Private event</Label>
            </div>
          </div>
          <Button type="submit" variant="default" className="w-full" disabled={saving}>
            {saving ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
