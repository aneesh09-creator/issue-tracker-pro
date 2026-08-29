import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  MessageSquare,
  Clock,
  User,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface BugDetailProps {
  bugId: Id<"bugs">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

const STATUS_CONFIG = {
  open: { label: "Open", color: "bg-[#7FBFFF]" },
  in_progress: { label: "In Progress", color: "bg-[#FFE066]" },
  resolved: { label: "Resolved", color: "bg-[#7FFF7F]" },
  closed: { label: "Closed", color: "bg-[#E0E0E0]" },
} as const;

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-[#7FBFFF]" },
  medium: { label: "Medium", color: "bg-[#FFE066]" },
  high: { label: "High", color: "bg-[#FF9F7F]" },
  critical: { label: "Critical", color: "bg-[#FF4444] text-white" },
} as const;

export function BugDetail({ bugId, open, onOpenChange, onEdit }: BugDetailProps) {
  const { user } = useAuth();
  const bug = useQuery(api.bugs.get, open ? { bugId } : "skip");
  const updateBug = useMutation(api.bugs.update);
  const removeBug = useMutation(api.bugs.remove);
  const addComment = useMutation(api.comments.add);
  const removeComment = useMutation(api.comments.remove);

  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    await updateBug({
      bugId,
      status: newStatus as "open" | "in_progress" | "resolved" | "closed",
    });
    toast.success("Status updated");
  };

  const handlePriorityChange = async (newPriority: string) => {
    await updateBug({
      bugId,
      priority: newPriority as "low" | "medium" | "high" | "critical",
    });
    toast.success("Priority updated");
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await addComment({ bugId, content: commentText.trim() });
      setCommentText("");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this bug? This cannot be undone.")) return;
    await removeBug({ bugId });
    onOpenChange(false);
    toast.success("Bug deleted");
  };

  const handleDeleteComment = async (commentId: Id<"comments">) => {
    await removeComment({ commentId });
    toast.success("Comment deleted");
  };

  if (!bug) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="nb-card bg-white p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusCfg = STATUS_CONFIG[bug.status as keyof typeof STATUS_CONFIG];
  const priorityCfg = PRIORITY_CONFIG[bug.priority as keyof typeof PRIORITY_CONFIG];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="nb-card bg-[#14142a]/95 backdrop-blur-md sm:max-w-[620px] p-0 gap-0 overflow-hidden max-h-[88vh] flex flex-col text-white">
        <DialogHeader className="px-6 pt-6 pb-5 border-b-2 border-[#1A1A1A]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold tracking-tight leading-tight">
                {bug.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`nb-shadow-sm px-2 py-0.5 text-xs font-bold uppercase ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
                <span className={`nb-shadow-sm px-2 py-0.5 text-xs font-bold uppercase ${priorityCfg.color}`}>
                  {priorityCfg.label}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Controls */}
          <div className="flex gap-2 flex-wrap items-center">
            <Select value={bug.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="nb-input rounded-none text-xs font-bold w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="nb-card rounded-none">
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bug.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="nb-input rounded-none text-xs font-bold w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="nb-card rounded-none">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="nb-btn rounded-none text-xs font-bold"
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              className="nb-btn rounded-none text-xs font-bold text-[#FF4444] hover:bg-[#FF4444] hover:text-white ml-auto"
              onClick={handleDelete}
            >
              <Trash2 className="size-3" /> Delete
            </Button>
          </div>

          {/* Description */}
          {bug.description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Description
              </h4>
              <div className="nb-border p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {bug.description}
              </div>
            </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <User className="size-3" /> Reporter
              </div>
              <div className="text-sm">
                {bug.reporter?.name || bug.reporter?.email || "Anonymous"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <AlertTriangle className="size-3" /> Assignee
              </div>
              <div className="text-sm">
                {bug.assignee?.name || bug.assignee?.email || "Unassigned"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <Clock className="size-3" /> Created
              </div>
              <div className="text-sm">
                {formatDistanceToNow(new Date(bug.createdAt), { addSuffix: true })}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <Clock className="size-3" /> Updated
              </div>
              <div className="text-sm">
                {formatDistanceToNow(new Date(bug.updatedAt), { addSuffix: true })}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-3 pt-1">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <MessageSquare className="size-3" /> Comments ({bug.comments?.length ?? 0})
            </h4>

            {bug.comments && bug.comments.length > 0 && (
              <div className="space-y-3">
                {bug.comments.map((comment) => (
                  <div key={comment._id} className="nb-border p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold">
                        {comment.author?.name || comment.author?.email || "Anonymous"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {user && comment.authorId === user._id && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-muted-foreground hover:text-[#FF4444] transition-colors"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment form */}
            <form onSubmit={handleAddComment} className="space-y-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="nb-input rounded-none min-h-[60px] resize-none text-sm"
                rows={2}
              />
              <Button
                type="submit"
                className="nb-btn bg-[#1A1A1A] text-white rounded-none font-bold text-sm h-9"
                disabled={isSubmittingComment || !commentText.trim()}
              >
                {isSubmittingComment ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  "Comment"
                )}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
