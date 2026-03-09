import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import { useUserProfileQuery } from "@/hooks/use-user";
import type { Task, Workspace } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  PlusCircle,
  Settings,
  User,
} from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";

interface HeaderProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
}

type NotifKind = "overdue" | "due_soon" | "updated";

interface Notification {
  id: string;
  kind: NotifKind;
  task: Task;
  message: string;
  time: Date;
}

const DOT_COLOR: Record<NotifKind, string> = {
  overdue:  "bg-red-500",
  due_soon: "bg-yellow-500",
  updated:  "bg-blue-400",
};

export const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
}: HeaderProps) => {
  const { user, logout } = useAuth();
  const { data: profile } = useUserProfileQuery();
  // prefer fresh profile data over auth context (auth context won't re-fetch after picture update)
  const displayUser = { ...user, ...(profile ?? {}) };
  const navigate = useNavigate();

  const { data: workspaces = [] } = useGetWorkspacesQuery() as { data: Workspace[] };
  const { data: myTasks   = [] } = useGetMyTasksQuery()    as { data: Task[]      };

  /* Build smart notifications from live task data */
  const notifications = useMemo<Notification[]>(() => {
    if (!myTasks?.length) return [];
    const now        = Date.now();
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
    const ONE_DAY    =     24 * 60 * 60 * 1000;
    const list: Notification[] = [];

    for (const task of myTasks) {
      if (task.isArchived) continue;
      const due = task.dueDate ? new Date(task.dueDate).getTime() : null;

      if (due && due < now && task.status !== "Done") {
        list.push({ id: `ov-${task._id}`, kind: "overdue",  task, message: `"${task.title}" is overdue`, time: new Date(task.dueDate!) });
      } else if (due && due - now < THREE_DAYS && due > now && task.status !== "Done") {
        list.push({ id: `ds-${task._id}`, kind: "due_soon", task, message: `"${task.title}" is due soon`,          time: new Date(task.dueDate!) });
      } else if (task.updatedAt && now - new Date(task.updatedAt).getTime() < ONE_DAY) {
        list.push({ id: `up-${task._id}`, kind: "updated",  task, message: `"${task.title}" was recently updated`, time: new Date(task.updatedAt) });
      }
    }
    return list.slice(0, 12);
  }, [myTasks]);

  const handleWorkspaceSelect = (ws: Workspace) => {
    onWorkspaceSelected(ws);
    navigate(`${window.location.pathname}?workspaceId=${ws._id}`, { replace: true });
  };

  const toTaskPath = (task: Task) =>
    `/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-4 lg:px-5">

      {/* ── Workspace selector ── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="tn-ws-btn">
            {selectedWorkspace ? (
              <>
                <WorkspaceAvatar
                  name={selectedWorkspace.name}
                  color={selectedWorkspace.color}
                />
                <span className="truncate hidden md:inline">{selectedWorkspace.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Select workspace</span>
            )}
            <ChevronDown className="size-3.5 ml-auto shrink-0 opacity-50" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel className="tn-eyebrow px-2 py-1.5">
            Your Workspaces
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No workspaces yet
            </div>
          ) : (
            workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws._id}
                onClick={() => handleWorkspaceSelect(ws)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <WorkspaceAvatar name={ws.name} color={ws.color} />
                <span className="truncate flex-1">{ws.name}</span>
                {selectedWorkspace?._id === ws._id && (
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onCreateWorkspace}
            className="flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="size-4 text-muted-foreground" />
            <span>New Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-1">

        {/* ── Notification bell ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-8">
              <Bell className="size-4" />
              {notifications.length > 0 && (
                <span className="tn-notif-badge">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between py-2">
              <span className="font-semibold text-sm">Notifications</span>
              {notifications.length > 0 && (
                <Badge variant="secondary" className="text-xs h-5 px-2">
                  {notifications.length}
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <ScrollArea className="max-h-[340px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CheckCircle2 className="size-8 text-muted-foreground mb-3 opacity-25" />
                  <p className="text-sm font-medium">All caught up</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No pending notifications
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    onClick={() => navigate(toTaskPath(notif.task))}
                    className="flex items-start gap-3 px-3 py-2.5 cursor-pointer"
                  >
                    <span
                      className={`mt-1.5 size-2 rounded-full shrink-0 ${DOT_COLOR[notif.kind]}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock className="size-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(notif.time, { addSuffix: true })}
                        </span>
                        <span
                          className={`tn-badge ml-auto ${
                            notif.task.priority === "High"
                              ? "tn-badge-high"
                              : notif.task.priority === "Medium"
                              ? "tn-badge-medium"
                              : "tn-badge-low"
                          }`}
                        >
                          {notif.task.priority}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>

            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-center text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => navigate("/my-tasks")}
                >
                  View all tasks →
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ── User avatar menu ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 rounded-full">
              <Avatar className="size-7">
                <AvatarImage src={displayUser?.profilePicture} alt={displayUser?.name} />
                <AvatarFallback className="text-xs font-semibold">
                  {displayUser?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal py-2">
              <p className="text-sm font-semibold leading-none">{displayUser?.name}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-none truncate">
                {displayUser?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/user/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="size-4" /> Profile &amp; Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="size-4" /> Workspace Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};