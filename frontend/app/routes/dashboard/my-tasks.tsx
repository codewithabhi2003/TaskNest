import { Loader } from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import type { Task } from "@/types";
import { format, isPast, isWithinInterval, addDays } from "date-fns";
import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Kanban,
  List,
  Search,
  SortAsc,
  SortDesc,
  ClipboardList,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

/* ─── helpers ──────────────────────────────────────────── */

const PRIORITY_STYLES: Record<string, { dot: string; badge: string; label: string }> = {
  High:   { dot: "bg-red-500",    badge: "bg-red-500/10 text-red-500 border-red-500/20",    label: "High"   },
  Medium: { dot: "bg-amber-400",  badge: "bg-amber-400/10 text-amber-500 border-amber-400/20", label: "Med"  },
  Low:    { dot: "bg-emerald-500",badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Low" },
};

const STATUS_STYLES: Record<string, { color: string; icon: React.ReactNode }> = {
  "To Do":       { color: "text-muted-foreground", icon: <Circle       className="size-3.5 text-muted-foreground" /> },
  "In Progress": { color: "text-amber-500",         icon: <Clock        className="size-3.5 text-amber-500" /> },
  "Done":        { color: "text-emerald-500",        icon: <CheckCircle2 className="size-3.5 text-emerald-500" /> },
};

const COLUMN_META = [
  { key: "To Do",       label: "To Do",       accent: "rgba(107,114,128,0.15)",  dot: "#6b7280" },
  { key: "In Progress", label: "In Progress", accent: "rgba(251,191,36,0.12)",   dot: "#fbbf24" },
  { key: "Done",        label: "Done",        accent: "rgba(52,211,153,0.12)",   dot: "#34d399" },
] as const;

const getDueBadge = (dueDate?: string | Date) => {
  if (!dueDate) return null;
  const d = dueDate instanceof Date ? dueDate : new Date(dueDate);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  if (isPast(d) && d < now) return { label: "Overdue", cls: "bg-red-500/10 text-red-500 border-red-500/20" };
  if (isWithinInterval(d, { start: now, end: addDays(now, 3) }))
    return { label: "Due soon", cls: "bg-amber-400/10 text-amber-500 border-amber-400/20" };
  return null;
};

/* ─── Task card (shared) ────────────────────────────────── */
const TaskCard = ({ task, compact = false }: { task: Task; compact?: boolean }) => {
  const pStyle  = PRIORITY_STYLES[task.priority ?? "Low"] ?? PRIORITY_STYLES.Low;
  const sStyle  = STATUS_STYLES[task.status]  ?? STATUS_STYLES["To Do"];
  const dueBadge = getDueBadge(task.dueDate);

  return (
    <Link
      to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
      className="group block"
    >
      <div className="rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-[rgba(232,255,71,0.25)]">
        {/* top row */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <span className="mt-0.5 shrink-0">{sStyle.icon}</span>
          <span className={`font-medium text-sm leading-snug group-hover:text-foreground transition-colors ${task.status === "Done" ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </span>
          <ArrowUpRight className="ml-auto size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* description — only in board compact view */}
        {!compact && task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 ml-5 mb-2.5 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* chips */}
        <div className="flex flex-wrap items-center gap-1.5 ml-5">
          {/* priority */}
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pStyle.badge}`}>
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${pStyle.dot}`} />
            {pStyle.label}
          </span>

          {/* due date */}
          {task.dueDate && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${dueBadge ? dueBadge.cls : "bg-muted/60 text-muted-foreground border-transparent"}`}>
              <Clock className="size-2.5" />
              {dueBadge ? dueBadge.label : format(new Date(task.dueDate), "MMM d")}
            </span>
          )}

          {/* archived */}
          {task.isArchived && (
            <span className="inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border bg-muted/60 text-muted-foreground border-transparent">
              Archived
            </span>
          )}
        </div>

        {/* project name */}
        <div className="mt-2.5 ml-5 text-[10px] text-muted-foreground">
          {task.project.title}
        </div>
      </div>
    </Link>
  );
};

/* ─── List row ──────────────────────────────────────────── */
const TaskRow = ({ task }: { task: Task }) => {
  const pStyle   = PRIORITY_STYLES[task.priority ?? "Low"] ?? PRIORITY_STYLES.Low;
  const sStyle   = STATUS_STYLES[task.status] ?? STATUS_STYLES["To Do"];
  const dueBadge = getDueBadge(task.dueDate);

  return (
    <Link
      to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
      className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40 rounded-xl"
    >
      {/* status icon */}
      <span className="shrink-0">{sStyle.icon}</span>

      {/* title + project */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate group-hover:text-foreground transition-colors ${task.status === "Done" ? "line-through text-muted-foreground" : ""}`}>
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{task.project.title}</p>
      </div>

      {/* chips */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pStyle.badge}`}>
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${pStyle.dot}`} />
          {pStyle.label}
        </span>

        {dueBadge && (
          <span className={`hidden md:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${dueBadge.cls}`}>
            {dueBadge.label}
          </span>
        )}

        {task.dueDate && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}
      </div>

      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
};

/* ─── Empty state ───────────────────────────────────────── */
const EmptyTasks = ({ label = "No tasks found" }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div
      className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
      style={{ background: "rgba(232,255,71,0.08)", border: "1.5px solid rgba(232,255,71,0.2)" }}
    >
      <ClipboardList className="size-5 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground">{label}</p>
    <p className="text-xs text-muted-foreground mt-1">Tasks assigned to you will appear here.</p>
  </div>
);

/* ─── Board column ──────────────────────────────────────── */
const BoardColumn = ({
  label,
  tasks,
  accent,
  dot,
}: {
  label: string;
  tasks: Task[];
  accent: string;
  dot: string;
}) => (
  <div className="flex flex-col rounded-2xl border bg-muted/20 overflow-hidden">
    {/* column header */}
    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ background: accent }}>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: "rgba(0,0,0,0.06)", color: "var(--muted-foreground)" }}
      >
        {tasks.length}
      </span>
    </div>

    {/* tasks */}
    <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[580px]">
      {tasks.length === 0
        ? <EmptyTasks label={`No ${label.toLowerCase()} tasks`} />
        : tasks.map((t) => <TaskCard key={t._id} task={t} compact />)
      }
    </div>
  </div>
);

/* ─── Main ──────────────────────────────────────────────── */
const MyTasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filter, setFilter]             = useState(searchParams.get("filter") || "all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    searchParams.get("sort") === "asc" ? "asc" : "desc"
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((v, k) => { params[k] = v; });
    params.filter = filter; params.sort = sortDirection; params.search = search;
    setSearchParams(params, { replace: true });
  }, [filter, sortDirection, search]);

  const { data: myTasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  const filtered = (myTasks ?? [])
    .filter((t) => {
      if (filter === "todo")       return t.status === "To Do";
      if (filter === "inprogress") return t.status === "In Progress";
      if (filter === "done")       return t.status === "Done";
      if (filter === "achieved")   return t.isArchived === true;
      if (filter === "high")       return t.priority === "High";
      return true;
    })
    .filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
    );

  const sorted = [...filtered].sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0;
    const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return sortDirection === "asc" ? diff : -diff;
  });

  const byStatus = (s: string) => sorted.filter((t) => t.status === s);

  const FILTER_LABELS: Record<string, string> = {
    all: "All Tasks", todo: "To Do", inprogress: "In Progress",
    done: "Done", achieved: "Achieved", high: "High Priority",
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader /></div>;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1" style={{ letterSpacing: "0.13em" }}>
            Workspace
          </p>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(1.35rem, 2.5vw, 1.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.2,
            }}
          >
            My Tasks
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* sort toggle */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setSortDirection((d) => d === "asc" ? "desc" : "asc")}
          >
            {sortDirection === "asc"
              ? <><SortAsc className="size-3.5" /> Oldest first</>
              : <><SortDesc className="size-3.5" /> Newest first</>}
          </Button>

          {/* filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Filter className="size-3.5" />
                {FILTER_LABELS[filter]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs">Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(FILTER_LABELS).map(([k, v]) => (
                <DropdownMenuItem
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`text-xs ${filter === k ? "font-semibold" : ""}`}
                >
                  {filter === k && <span className="mr-1.5 text-[#e8ff47]">●</span>}
                  {v}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 text-sm"
        />
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="list">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <TabsList className="h-9">
            <TabsTrigger value="list" className="gap-1.5 text-xs px-3">
              <List className="size-3.5" /> List
            </TabsTrigger>
            <TabsTrigger value="board" className="gap-1.5 text-xs px-3">
              <Kanban className="size-3.5" /> Board
            </TabsTrigger>
          </TabsList>

          {/* task count */}
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{sorted.length}</span> task{sorted.length !== 1 ? "s" : ""}
            {filter !== "all" && ` · ${FILTER_LABELS[filter]}`}
          </p>
        </div>

        {/* ── LIST VIEW ── */}
        <TabsContent value="list">
          <div className="rounded-2xl border bg-card overflow-hidden">
            {/* column headers */}
            <div className="hidden sm:grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 border-b bg-muted/30">
              <span className="w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Task</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pr-6">Due</span>
            </div>

            <div className="divide-y divide-border/60 p-2">
              {sorted.length === 0
                ? <EmptyTasks />
                : sorted.map((t) => <TaskRow key={t._id} task={t} />)
              }
            </div>
          </div>
        </TabsContent>

        {/* ── BOARD VIEW ── */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMN_META.map((col) => (
              <BoardColumn
                key={col.key}
                label={col.label}
                tasks={byStatus(col.key)}
                accent={col.accent}
                dot={col.dot}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTasks;