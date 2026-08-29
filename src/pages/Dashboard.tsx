import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  Plus,
  Search,
  Bug,
  CircleDot,
  Clock,
  CheckCircle2,
  Archive,
  AlertTriangle,
  X,
} from "lucide-react";
import { BugForm } from "@/components/BugForm";
import { BugDetail } from "@/components/BugDetail";
import type { Id } from "@/convex/_generated/dataModel";

const STATUS_COLUMNS = [
  {
    key: "open",
    label: "Open",
    icon: <CircleDot className="size-4" />,
    color: "bg-[#7FBFFF]",
  },
  {
    key: "in_progress",
    label: "In Progress",
    icon: <Clock className="size-4" />,
    color: "bg-[#FFE066]",
  },
  {
    key: "resolved",
    label: "Resolved",
    icon: <CheckCircle2 className="size-4" />,
    color: "bg-[#7FFF7F]",
  },
  {
    key: "closed",
    label: "Closed",
    icon: <Archive className="size-4" />,
    color: "bg-[#E0E0E0]",
  },
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-[#7FBFFF]",
  medium: "bg-[#FFE066]",
  high: "bg-[#FF9F7F]",
  critical: "bg-[#FF4444] text-white",
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const stats = useQuery(api.bugs.stats);
  const bugs = useQuery(api.bugs.list, {});

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBugId, setSelectedBugId] = useState<Id<"bugs"> | null>(null);
  const [editingBug, setEditingBug] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  const filteredBugs = useMemo(() => {
    if (!bugs) return [];
    return bugs.filter((bug) => {
      const matchesSearch =
        !search ||
        bug.title.toLowerCase().includes(search.toLowerCase()) ||
        (bug.description && bug.description.toLowerCase().includes(search.toLowerCase()));
      const matchesPriority =
        priorityFilter === "all" || bug.priority === priorityFilter;
      const matchesAssignee =
        assigneeFilter === "all" ||
        (assigneeFilter === "unassigned" && !bug.assigneeId) ||
        bug.assigneeId === assigneeFilter;
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [bugs, search, priorityFilter, assigneeFilter]);

  const bugsByStatus = useMemo(() => {
    const map: Record<string, typeof filteredBugs> = {};
    for (const col of STATUS_COLUMNS) {
      map[col.key] = filteredBugs.filter((b) => b.status === col.key);
    }
    return map;
  }, [filteredBugs]);

  const uniqueAssignees = useMemo(() => {
    if (!bugs) return [];
    const map = new Map<string, { id: string; name?: string; email?: string }>();
    for (const bug of bugs) {
      if (bug.assignee) {
        map.set(bug.assignee.id, bug.assignee);
      }
    }
    return Array.from(map.values());
  }, [bugs]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleEditBug = (bug: any) => {
    setEditingBug(bug);
    setSelectedBugId(null);
    setShowCreateForm(true);
  };

  const activeFilters =
    priorityFilter !== "all" || assigneeFilter !== "all" || search !== "";

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      {/* Top Bar */}
      <header className="border-b-2 border-[#1A1A1A] px-6 py-3 bg-white">
        <div className="mx-auto max-w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="nb-shadow-sm bg-[#FFE066] p-1.5">
              <Bug className="size-4" />
            </div>
            <span className="text-lg font-bold tracking-tight uppercase hidden sm:block">
              BugHive
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user?.name || user?.email || "Team Member"}
            </span>
            <Button
              variant="outline"
              className="nb-btn rounded-none font-bold text-xs"
              onClick={handleSignOut}
            >
              <LogOut className="size-3" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-full px-6 py-6 space-y-5">
        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0">
            {[
              { label: "Total", value: stats.total, color: "bg-white" },
              { label: "Open", value: stats.open, color: "bg-[#7FBFFF]" },
              { label: "In Progress", value: stats.inProgress, color: "bg-[#FFE066]" },
              { label: "Resolved", value: stats.resolved, color: "bg-[#7FFF7F]" },
              { label: "Critical", value: stats.critical, color: "bg-[#FF4444] text-white" },
              { label: "High", value: stats.high, color: "bg-[#FF9F7F]" },
            ].map((s) => (
              <div key={s.label} className="nb-border p-3 bg-white">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
                <div className={`text-2xl font-bold mt-1 inline-block nb-shadow-sm px-2 ${s.color}`}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button
            className="nb-btn bg-[#1A1A1A] text-white rounded-none font-bold"
            onClick={() => {
              setEditingBug(null);
              setShowCreateForm(true);
            }}
          >
            <Plus className="size-4" /> New Bug
          </Button>

          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search bugs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="nb-input rounded-none pl-8 h-9"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="nb-input rounded-none h-9 w-auto text-xs font-bold">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="nb-card rounded-none">
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="nb-input rounded-none h-9 w-auto text-xs font-bold">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent className="nb-card rounded-none">
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {uniqueAssignees.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name || a.email || "Anonymous"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeFilters && (
              <Button
                variant="outline"
                className="nb-btn rounded-none h-9 text-xs font-bold"
                onClick={() => {
                  setSearch("");
                  setPriorityFilter("all");
                  setAssigneeFilter("all");
                }}
              >
                <X className="size-3" /> Clear
              </Button>
            )}
          </div>

          <div className="flex border-2 border-[#1A1A1A]">
            <button
              onClick={() => setViewMode("board")}
              className={`px-3 py-1.5 text-xs font-bold uppercase ${
                viewMode === "board" ? "bg-[#1A1A1A] text-white" : "bg-white"
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs font-bold uppercase border-l-2 border-[#1A1A1A] ${
                viewMode === "list" ? "bg-[#1A1A1A] text-white" : "bg-white"
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Board View */}
        {viewMode === "board" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0">
            {STATUS_COLUMNS.map((col) => (
              <div key={col.key} className="border-2 border-[#1A1A1A]">
                <div className="px-4 py-3 border-b-2 border-[#1A1A1A] flex items-center gap-2">
                  {col.icon}
                  <span className="font-bold text-sm uppercase tracking-wide">
                    {col.label}
                  </span>
                  <Badge
                    variant="secondary"
                    className="nb-shadow-sm rounded-none border-0 font-bold ml-auto"
                  >
                    {bugsByStatus[col.key]?.length ?? 0}
                  </Badge>
                </div>
                <div className="p-2 space-y-2 min-h-[120px] bg-[#F5F5F5]">
                  {(bugsByStatus[col.key] ?? []).map((bug) => (
                    <button
                      key={bug._id}
                      onClick={() => setSelectedBugId(bug._id)}
                      className="nb-card bg-white p-3 text-left w-full hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#1A1A1A] transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-sm font-bold leading-tight line-clamp-2">
                          {bug.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`nb-shadow-sm px-1.5 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_COLORS[bug.priority]}`}
                        >
                          {bug.priority}
                        </span>
                        {bug.assignee && (
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {bug.assignee.name || bug.assignee.email || "?"}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  {(bugsByStatus[col.key] ?? []).length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-6 italic">
                      No bugs
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="nb-border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#1A1A1A] bg-[#F0F0F0]">
                  <th className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wider hidden md:table-cell">
                    Priority
                  </th>
                  <th className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wider hidden lg:table-cell">
                    Assignee
                  </th>
                  <th className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wider hidden xl:table-cell">
                    Reporter
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBugs.map((bug) => (
                  <tr
                    key={bug._id}
                    className="border-b border-[#1A1A1A] hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                    onClick={() => setSelectedBugId(bug._id)}
                  >
                    <td className="px-4 py-3 font-medium">{bug.title}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`nb-shadow-sm px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          STATUS_COLUMNS.find((c) => c.key === bug.status)?.color ??
                          "bg-[#E0E0E0]"
                        }`}
                      >
                        {STATUS_COLUMNS.find((c) => c.key === bug.status)?.label ??
                          bug.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className={`nb-shadow-sm px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          PRIORITY_COLORS[bug.priority] ?? ""
                        }`}
                      >
                        {bug.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {bug.assignee?.name || bug.assignee?.email || (
                        <span className="italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">
                      {bug.reporter?.name || bug.reporter?.email || "Anonymous"}
                    </td>
                  </tr>
                ))}
                {filteredBugs.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-muted-foreground italic"
                    >
                      {bugs === undefined ? (
                        "Loading bugs..."
                      ) : bugs.length === 0 ? (
                        <div className="space-y-2">
                          <AlertTriangle className="size-6 mx-auto" />
                          <p>No bugs yet. Create your first one!</p>
                        </div>
                      ) : (
                        "No bugs match your filters."
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Form */}
      <BugForm
        open={showCreateForm}
        onOpenChange={(open) => {
          setShowCreateForm(open);
          if (!open) setEditingBug(null);
        }}
        editBug={editingBug}
      />

      {/* Bug Detail */}
      {selectedBugId && (
        <BugDetail
          bugId={selectedBugId}
          open={!!selectedBugId}
          onOpenChange={(open) => {
            if (!open) setSelectedBugId(null);
          }}
          onEdit={() => {
            const bug = bugs?.find((b) => b._id === selectedBugId);
            if (bug) handleEditBug(bug);
          }}
        />
      )}
    </main>
  );
}
