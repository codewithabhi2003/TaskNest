import { Loader } from "@/components/loader";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import type { Task } from "@/types";
import { format, isPast } from "date-fns";
import {
  Archive,
  ArrowUpRight,
  Clock,
  FolderKanban,
  PackageOpen,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";

/* ─── helpers ──────────────────────────────────────────── */

const PRIORITY_META: Record<string, { dot: string; cls: string }> = {
  High:   { dot: "bg-red-500",    cls: "bg-red-500/10 text-red-500 border-red-500/20" },
  Medium: { dot: "bg-amber-400",  cls: "bg-amber-400/10 text-amber-500 border-amber-400/20" },
  Low:    { dot: "bg-emerald-500",cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
};

const PriorityBadge = ({ priority }: { priority?: string }) => {
  if (!priority) return null;
  const m = PRIORITY_META[priority] ?? PRIORITY_META.Low;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {priority}
    </span>
  );
};

/* ─── Task card ─────────────────────────────────────────── */
const ArchivedCard = ({ task }: { task: Task }) => {
  const overdue = task.dueDate && isPast(new Date(task.dueDate));

  return (
    <Link
      to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
      className="group block"
    >
      <div className="rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-[rgba(232,255,71,0.25)]">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">

          {/* Left */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start gap-2">
              <p className="text-sm font-semibold leading-snug line-through text-muted-foreground group-hover:text-foreground transition-colors">
                {task.title}
              </p>
              <ArrowUpRight className="size-3.5 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-[rgba(232,255,71,0.08)] text-[#a89a00] border-[rgba(232,255,71,0.3)] dark:text-[#e8ff47]">
                <Archive className="size-2.5" />
                Archived
              </span>
              <PriorityBadge priority={task.priority} />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FolderKanban className="size-3.5 shrink-0" />
              <span className="font-medium truncate">{task.project.title}</span>
            </div>
          </div>

          {/* Right — dates */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 shrink-0 text-xs text-muted-foreground">
            {task.dueDate && (
              <div className={`flex items-center gap-1 ${overdue ? "text-red-500" : ""}`}>
                <Clock className="size-3 shrink-0" />
                <span>Due {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
              </div>
            )}
            <div className="text-muted-foreground/60 text-[10px]">
              Updated {format(new Date(task.updatedAt), "MMM d, yyyy")}
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
};

/* ─── Empty state ───────────────────────────────────────── */
const EmptyArchive = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div
      className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
      style={{ background: "rgba(232,255,71,0.07)", border: "1.5px solid rgba(232,255,71,0.2)" }}
    >
      <PackageOpen className="size-7 text-muted-foreground" strokeWidth={1.5} />
    </div>
    <p className="text-sm font-semibold text-foreground">Nothing archived yet</p>
    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
      Tasks you archive will appear here. They are kept safe and can be
      referenced at any time.
    </p>
  </div>
);

/* ─── No workspace ──────────────────────────────────────── */
const NoWorkspace = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
    <div
      className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
      style={{ background: "rgba(232,255,71,0.07)", border: "1.5px solid rgba(232,255,71,0.2)" }}
    >
      <Archive className="size-7 text-muted-foreground" strokeWidth={1.5} />
    </div>
    <p className="text-sm font-semibold text-foreground">No workspace selected</p>
    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
      Select a workspace from the header above to view its archived tasks.
    </p>
  </div>
);

/* ─── Main ──────────────────────────────────────────────── */
const Achieved = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const { data: tasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader />
    </div>
  );

  if (!workspaceId) return <NoWorkspace />;

  const archived = (tasks ?? []).filter(
    (t) => t.isArchived && String(t.project.workspace) === workspaceId
  );

  /* group by project */
  const byProject = archived.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.project._id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1"
            style={{ letterSpacing: "0.13em" }}
          >
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
            Archived Tasks
          </h1>
        </div>

        {archived.length > 0 && (
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1 rounded-full border self-start sm:self-auto"
            style={{
              background: "rgba(232,255,71,0.08)",
              borderColor: "rgba(232,255,71,0.3)",
              color: "var(--muted-foreground)",
            }}
          >
            <Archive className="size-2.5" />
            {archived.length} archived task{archived.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Content */}
      {archived.length === 0 ? (
        <EmptyArchive />
      ) : (
        <div className="space-y-8">
          {Object.entries(byProject).map(([, projectTasks]) => {
            const project = projectTasks[0].project;
            return (
              <div key={project._id} className="space-y-2.5">
                {/* project group header */}
                <div className="flex items-center gap-2 px-1 mb-1">
                  <FolderKanban className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {project.title}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(232,255,71,0.1)", color: "var(--muted-foreground)" }}
                  >
                    {projectTasks.length}
                  </span>
                </div>

                {projectTasks.map((t) => <ArchivedCard key={t._id} task={t} />)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Achieved;