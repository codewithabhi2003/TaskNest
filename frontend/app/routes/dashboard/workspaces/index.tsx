import { Loader } from "@/components/loader";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { WorkspaceAvatar } from "@/components/workspace/workspace-avatar";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import type { Workspace } from "@/types";
import { format } from "date-fns";
import { ArrowUpRight, LayoutGrid, Plus, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

/* ─── Empty state ───────────────────────────────────────── */
const EmptyState = ({ onCreate }: { onCreate: () => void }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
    <div
      className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
      style={{ background: "rgba(232,255,71,0.07)", border: "1.5px solid rgba(232,255,71,0.2)" }}
    >
      <LayoutGrid className="size-7 text-muted-foreground" strokeWidth={1.5} />
    </div>
    <p className="text-sm font-semibold text-foreground">No workspaces yet</p>
    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
      Create your first workspace to start organising projects and collaborating with your team.
    </p>
    <button
      onClick={onCreate}
      className="tn-submit-btn mt-5"
      style={{ width: "auto", padding: "9px 24px", fontSize: "0.85rem" }}
    >
      Create Workspace
    </button>
  </div>
);

/* ─── Workspace card ────────────────────────────────────── */
const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => (
  <Link to={`/workspaces/${workspace._id}`} className="group block">
    <div className="relative overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-[3px] hover:border-[rgba(232,255,71,0.3)]">

      {/* accent glow on hover */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "radial-gradient(circle, rgba(232,255,71,0.15) 0%, transparent 70%)" }}
      />

      {/* top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <WorkspaceAvatar name={workspace.name} color={workspace.color} />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate leading-tight group-hover:text-foreground transition-colors">
              {workspace.name}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {format(new Date(workspace.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
      </div>

      {/* description */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4 min-h-10">
        {workspace.description || "No description provided."}
      </p>

      {/* footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        {/* member count */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />
          <span>
            {workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* colour dot */}
        <span
          className="h-2.5 w-2.5 rounded-full ring-2 ring-background"
          style={{ background: workspace.color || "#e8ff47" }}
        />
      </div>
    </div>
  </Link>
);

/* ─── Main ──────────────────────────────────────────────── */
const Workspaces = () => {
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const { data: workspaces = [], isLoading } = useGetWorkspacesQuery();

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader />
    </div>
  );

  return (
    <>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1"
              style={{ letterSpacing: "0.13em" }}
            >
              Overview
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
              Workspaces
            </h1>
          </div>

          <button
            onClick={() => setIsCreatingWorkspace(true)}
            className="tn-submit-btn self-start sm:self-auto"
            style={{ width: "auto", padding: "9px 20px", fontSize: "0.85rem" }}
          >
            <Plus className="size-3.5" />
            New Workspace
          </button>
        </div>

        {/* ── Count line ── */}
        {workspaces.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{workspaces.length}</span>{" "}
            workspace{workspaces.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* ── Grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.length === 0 ? (
            <EmptyState onCreate={() => setIsCreatingWorkspace(true)} />
          ) : (
            workspaces.map((ws: Workspace) => (
              <WorkspaceCard key={ws._id} workspace={ws} />
            ))
          )}
        </div>

      </div>

      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </>
  );
};

export default Workspaces;
