import { Loader } from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import type { Workspace } from "@/types";
import { Crown, Kanban, List, Search, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

/* ─── helpers ──────────────────────────────────────────── */

const ROLE_META: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  owner: {
    label: "Owner",
    icon: <Crown  className="size-2.5" />,
    cls:  "bg-[rgba(232,255,71,0.12)] text-[#a89a00] border-[rgba(232,255,71,0.35)] dark:text-[#e8ff47]",
  },
  admin: {
    label: "Admin",
    icon: <Shield className="size-2.5" />,
    cls:  "bg-red-500/10 text-red-500 border-red-500/20",
  },
  member: {
    label: "Member",
    icon: <Users  className="size-2.5" />,
    cls:  "bg-muted/80 text-muted-foreground border-border",
  },
};

const getRoleMeta = (role: string) =>
  ROLE_META[role?.toLowerCase()] ?? ROLE_META.member;

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

/* consistent avatar colours from name */
const AVATAR_COLOURS = [
  ["#e8ff47","#0d0f14"], ["#a78bfa","#0d0f14"], ["#34d399","#0d0f14"],
  ["#60a5fa","#0d0f14"], ["#f472b6","#0d0f14"], ["#fb923c","#0d0f14"],
];
const avatarColour = (name: string) =>
  AVATAR_COLOURS[name.charCodeAt(0) % AVATAR_COLOURS.length];

/* ─── Role badge ────────────────────────────────────────── */
const RoleBadge = ({ role }: { role: string }) => {
  const m = getRoleMeta(role);
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${m.cls}`}>
      {m.icon}{m.label}
    </span>
  );
};

/* ─── Empty state ───────────────────────────────────────── */
const EmptyState = ({ query }: { query: string }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    <div
      className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
      style={{ background: "rgba(232,255,71,0.08)", border: "1.5px solid rgba(232,255,71,0.2)" }}
    >
      <Users className="size-5 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground">
      {query ? `No members matching "${query}"` : "No members yet"}
    </p>
    <p className="text-xs text-muted-foreground mt-1">
      Invite people to your workspace to collaborate.
    </p>
  </div>
);

/* ─── List row ──────────────────────────────────────────── */
const MemberRow = ({ member, workspaceName }: { member: any; workspaceName: string }) => {
  const [bg, fg] = avatarColour(member.user.name);
  return (
    <div className="group flex items-center gap-4 px-4 py-3 rounded-xl transition-colors hover:bg-muted/40">
      <Avatar className="size-9 shrink-0 ring-2 ring-transparent group-hover:ring-[rgba(232,255,71,0.3)] transition-all">
        <AvatarImage src={member.user.profilePicture} />
        <AvatarFallback style={{ background: bg, color: fg }} className="text-xs font-bold">
          {initials(member.user.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{member.user.name}</p>
        <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <RoleBadge role={member.role} />
        <span className="hidden sm:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border bg-muted/60 text-muted-foreground border-transparent">
          {workspaceName}
        </span>
      </div>
    </div>
  );
};

/* ─── Grid card ─────────────────────────────────────────── */
const MemberCard = ({ member }: { member: any }) => {
  const [bg, fg] = avatarColour(member.user.name);
  const m = getRoleMeta(member.role);
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-[rgba(232,255,71,0.25)]">
      {/* subtle corner glow */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "radial-gradient(circle, rgba(232,255,71,0.15) 0%, transparent 70%)" }}
      />

      <Avatar className="size-16 mb-3 ring-2 ring-transparent group-hover:ring-[rgba(232,255,71,0.35)] transition-all">
        <AvatarImage src={member.user.profilePicture} />
        <AvatarFallback style={{ background: bg, color: fg }} className="text-base font-bold">
          {initials(member.user.name)}
        </AvatarFallback>
      </Avatar>

      <p className="font-semibold text-sm truncate w-full">{member.user.name}</p>
      <p className="text-xs text-muted-foreground truncate w-full mt-0.5 mb-3">
        {member.user.email}
      </p>

      <RoleBadge role={member.role} />
    </div>
  );
};

/* ─── Main ──────────────────────────────────────────────── */
const Members = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((v, k) => { params[k] = v; });
    params.search = search;
    setSearchParams(params, { replace: true });
  }, [search]);

  const { data, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
    data: Workspace;
    isLoading: boolean;
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader /></div>;
  if (!data || !workspaceId) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground text-sm">No workspace found.</p>
    </div>
  );

  const filtered = data.members?.filter((m) =>
    m.user.name.toLowerCase().includes(search.toLowerCase()) ||
    m.user.email.toLowerCase().includes(search.toLowerCase()) ||
    m.role?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  /* role breakdown for stats */
  const owners  = data.members?.filter((m) => m.role === "owner").length  ?? 0;
  const admins  = data.members?.filter((m) => m.role === "admin").length  ?? 0;
  const members = data.members?.filter((m) => m.role === "member").length ?? 0;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1" style={{ letterSpacing: "0.13em" }}>
            {data.name}
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
            Workspace Members
          </h1>
        </div>

        {/* Role stat pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {owners > 0 && (
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${ROLE_META.owner.cls}`}>
              <Crown className="size-2.5" />{owners} owner{owners > 1 ? "s" : ""}
            </span>
          )}
          {admins > 0 && (
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${ROLE_META.admin.cls}`}>
              <Shield className="size-2.5" />{admins} admin{admins > 1 ? "s" : ""}
            </span>
          )}
          {members > 0 && (
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${ROLE_META.member.cls}`}>
              <Users className="size-2.5" />{members} member{members > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name, email or role…"
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
              <Kanban className="size-3.5" /> Grid
            </TabsTrigger>
          </TabsList>

          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            {data.members?.length ?? 0} member{data.members?.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── LIST ── */}
        <TabsContent value="list">
          <div className="rounded-2xl border bg-card overflow-hidden">
            {/* column headers */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 border-b bg-muted/30">
              <span className="w-9 shrink-0" />
              <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Member</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pr-2">Role</span>
            </div>
            <div className="divide-y divide-border/60 p-2">
              {filtered.length === 0
                ? <EmptyState query={search} />
                : filtered.map((m) => (
                    <MemberRow key={m.user._id} member={m} workspaceName={data.name} />
                  ))
              }
            </div>
          </div>
        </TabsContent>

        {/* ── GRID ── */}
        <TabsContent value="board">
          {filtered.length === 0
            ? (
              <div className="rounded-2xl border bg-card p-6">
                <EmptyState query={search} />
              </div>
            )
            : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((m) => <MemberCard key={m.user._id} member={m} />)}
              </div>
            )
          }
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Members;