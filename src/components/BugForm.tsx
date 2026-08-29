import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface BugFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editBug?: {
    _id: Id<"bugs">;
    title: string;
    description?: string;
    status: string;
    priority: string;
    assigneeId?: Id<"users">;
  } | null;
}

export function BugForm({ open, onOpenChange, editBug }: BugFormProps) {
  const createBug = useMutation(api.bugs.create);
  const updateBug = useMutation(api.bugs.update);
  const users = useQuery(api.bugs.getAllUsers);

  const [title, setTitle] = useState(editBug?.title ?? "");
  const [description, setDescription] = useState(editBug?.description ?? "");
  const [priority, setPriority] = useState<string>(editBug?.priority ?? "medium");
  const [status, setStatus] = useState<string>(editBug?.status ?? "open");
  const [assigneeId, setAssigneeId] = useState<string>(editBug?.assigneeId ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTitle(editBug?.title ?? "");
      setDescription(editBug?.description ?? "");
      setPriority(editBug?.priority ?? "medium");
      setStatus(editBug?.status ?? "open");
      setAssigneeId(editBug?.assigneeId ?? "");
    }
    onOpenChange(nextOpen);
  };

  const resolvedAssigneeId =
    assigneeId && assigneeId !== "unassigned"
      ? (assigneeId as Id<"users">)
      : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);

    try {
      if (editBug) {
        await updateBug({
          bugId: editBug._id,
          title: title.trim(),
          description: description.trim() || undefined,
          priority: priority as "low" | "medium" | "high" | "critical",
          status: status as "open" | "in_progress" | "resolved" | "closed",
          assigneeId: resolvedAssigneeId,
        });
      } else {
        await createBug({
          title: title.trim(),
          description: description.trim() || undefined,
          priority: priority as "low" | "medium" | "high" | "critical",
          assigneeId: resolvedAssigneeId,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save bug:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="nb-card bg-white sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b-2 border-[#1A1A1A]">
          <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2.5">
            <div className="nb-shadow-sm bg-[#FFE066] p-1.5">
              <Plus className="size-4" />
            </div>
            {editBug ? "Edit Bug" : "New Bug"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wide">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short, descriptive title"
              className="nb-input rounded-none h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wide">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Steps to reproduce, expected vs actual behavior..."
              className="nb-input rounded-none min-h-[88px] resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase tracking-wide">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="nb-input rounded-none w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="nb-card rounded-none">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editBug && (
              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase tracking-wide">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="nb-input rounded-none w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="nb-card rounded-none">
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {users && users.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase tracking-wide">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="nb-input rounded-none w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent className="nb-card rounded-none">
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email || "Anonymous"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2.5 pt-3 pb-1">
            <Button
              type="button"
              variant="outline"
              className="nb-btn rounded-none flex-1 font-bold h-11"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="nb-btn bg-[#1A1A1A] text-white rounded-none flex-1 font-bold hover:bg-[#333333] h-11"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editBug ? (
                "Update"
              ) : (
                "Create Bug"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
