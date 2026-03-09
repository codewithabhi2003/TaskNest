import { RecentProjects } from "@/components/dashboard/recnt-projects";
import { StatsCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { Loader } from "@/components/loader";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { useGetWorkspaceStatsQuery } from "@/hooks/use-workspace";
import type {
  Project,
  ProjectStatusData,
  StatsCardProps,
  Task,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import {
  AlertTriangle,
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  RefreshCw,
  Users,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

/* ─── tiny sub-components ─────────────────────────────── */

const FeatureCard = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-1">
    {/* accent corner glow */}
    <div
      className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: "radial-gradient(circle, rgba(232,255,71,0.18) 0%, transparent 70%)" }}
    />
    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
      {icon}
    </div>
    <h3 className="font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);

/* ─── Empty / no-workspace state ───────────────────────── */
const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center px-6">
      <div className="max-w-2xl w-full">

        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div
            className="relative flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{ background: "rgba(232,255,71,0.1)", border: "1.5px solid rgba(232,255,71,0.3)" }}
          >
            <LayoutDashboard className="size-9 text-foreground" strokeWidth={1.5} />
            {/* pulse ring */}
            <span
              className="absolute inset-0 rounded-2xl animate-ping"
              style={{ background: "rgba(232,255,71,0.07)", animationDuration: "2.4s" }}
            />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "var(--muted-foreground)", letterSpacing: "0.14em" }}
          >
            No workspace selected
          </p>
          <h1
            className="mb-3 leading-tight"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "var(--foreground)",
            }}
          >
            Welcome to{" "}
            <span className="relative inline-block">
              TaskNest
              <span
                className="absolute left-0 bottom-[3px] w-full h-2 -z-10 -skew-x-3"
                style={{ background: "#e8ff47" }}
              />
            </span>
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Select a workspace from the header to view your dashboard, or create
            a new one to get started.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <button
            onClick={() => navigate("/workspaces")}
            className="tn-submit-btn"
            style={{ width: "auto", padding: "10px 28px", fontSize: "0.9rem" }}
          >
            Create a Workspace →
          </button>
          <button
            onClick={() => navigate("/workspaces")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Browse Workspaces
          </button>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <FeatureCard
            icon={<BarChart3 className="size-5" />}
            title="Track Progress"
            desc="Visual dashboards and analytics keep your team in control at a glance."
          />
          <FeatureCard
            icon={<FolderKanban className="size-5" />}
            title="Organise Projects"
            desc="Structure work into projects with Kanban boards and sprint planning."
          />
          <FeatureCard
            icon={<Users className="size-5" />}
            title="Collaborate"
            desc="Assign tasks, leave comments, and track team productivity in real time."
          />
        </div>

      </div>
    </div>
  );
};

/* ─── Loading skeleton ──────────────────────────────────── */
const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* heading */}
    <div className="flex items-center justify-between">
      <div className="h-7 w-36 rounded-lg bg-muted" />
      <div className="h-5 w-24 rounded-lg bg-muted" />
    </div>
    {/* stat cards row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-muted" />
      ))}
    </div>
    {/* chart area */}
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="h-64 rounded-2xl bg-muted" />
      <div className="h-64 rounded-2xl bg-muted" />
    </div>
    {/* bottom row */}
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="h-52 rounded-2xl bg-muted" />
      <div className="h-52 rounded-2xl bg-muted" />
    </div>
  </div>
);

/* ─── Error state ───────────────────────────────────────── */
const ErrorState = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
    <div
      className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
      style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.25)" }}
    >
      <AlertTriangle className="size-7 text-destructive" />
    </div>
    <h2
      className="mb-2 text-xl font-bold"
      style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}
    >
      Failed to load dashboard
    </h2>
    <p className="text-sm text-muted-foreground mb-6 max-w-xs">
      Something went wrong while fetching your workspace data. Please try again.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive hover:bg-destructive/15 transition-colors"
    >
      <RefreshCw className="size-3.5" />
      Retry
    </button>
  </div>
);

/* ─── Main Dashboard ────────────────────────────────────── */
const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId") ?? undefined;

  const { data, isPending, error } = useGetWorkspaceStatsQuery(workspaceId) as {
    data?: {
      stats: StatsCardProps;
      taskTrendsData: TaskTrendsData[];
      projectStatusData: ProjectStatusData[];
      taskPriorityData: TaskPriorityData[];
      workspaceProductivityData: WorkspaceProductivityData[];
      upcomingTasks: Task[];
      recentProjects: Project[];
    };
    isPending: boolean;
    error: unknown;
  };

  if (!workspaceId) return <EmptyState />;
  if (isPending)    return <DashboardSkeleton />;
  if (error)        return <ErrorState />;
  if (!data)        return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground text-sm">No data available for this workspace.</p>
    </div>
  );

  return (
    <div className="space-y-8 2xl:space-y-10">

      {/* ── Page heading ── */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--muted-foreground)", letterSpacing: "0.13em" }}
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
              color: "var(--foreground)",
            }}
          >
            Dashboard
          </h1>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground select-none">
          <span
            className="inline-block h-2 w-2 rounded-full animate-pulse"
            style={{ background: "#22c55e", animationDuration: "2s" }}
          />
          Live data
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCard data={data.stats} />

      {/* Charts */}
      <StatisticsCharts
        stats={data.stats}
        taskTrendsData={data.taskTrendsData}
        projectStatusData={data.projectStatusData}
        taskPriorityData={data.taskPriorityData}
        workspaceProductivityData={data.workspaceProductivityData}
      />

      {/* Recent Projects + Upcoming Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentProjects data={data.recentProjects} />
        <UpcomingTasks data={data.upcomingTasks} />
      </div>

    </div>
  );
};

export default Dashboard;