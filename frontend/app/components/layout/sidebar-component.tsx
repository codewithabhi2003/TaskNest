import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/auth-context";
import { useTheme } from "@/provider/theme-provider";
import type { Workspace } from "@/types";
import {
  Archive,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarNav } from "./sidebar-nav";

const navItems = [
  { title: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { title: "Workspaces", href: "/workspaces",  icon: Users },
  { title: "My Tasks",   href: "/my-tasks",    icon: ListChecks },
  { title: "Members",    href: "/members",     icon: Users },
  { title: "Archived",   href: "/achieved",    icon: Archive },
  { title: "Settings",   href: "/settings",    icon: Settings },
];

export const SidebarComponent = ({
  currentWorkspace,
}: {
  currentWorkspace: Workspace | null;
}) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-sidebar transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16 md:w-[60px]" : "w-16 md:w-60"
      )}
    >
      {/* ── Logo row ── */}
      <div className="flex h-14 items-center border-b px-3 gap-2">
        <Link
          to="/dashboard"
          className={cn(
            "flex items-center flex-1 min-w-0",
            isCollapsed ? "justify-center" : "gap-2"
          )}
        >
          {/* Always visible on mobile; icon when collapsed on desktop */}
          <Menu className="h-5 w-5 text-primary shrink-0 md:hidden" />
          {isCollapsed
            ? <Menu className="h-5 w-5 text-primary shrink-0 hidden md:block" />
            : (
              <span className="tn-logo-text hidden md:block truncate">
                TaskNest<span className="tn-logo-dot" />
              </span>
            )
          }
        </Link>

        {/* Collapse toggle — desktop only */}
        <button
          className="tn-collapse-btn hidden md:flex shrink-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed
            ? <ChevronsRight className="size-3.5" />
            : <ChevronsLeft  className="size-3.5" />}
        </button>
      </div>

      {/* ── Nav items ── */}
      <ScrollArea className="flex-1 px-2 py-3">
        <SidebarNav
          items={navItems}
          isCollapsed={isCollapsed}
          currentWorkspace={currentWorkspace}
          className={cn(isCollapsed && "items-center")}
        />
      </ScrollArea>

      {/* ── Bottom actions ── */}
      <div className="px-2 py-3 border-t space-y-0.5">
        {/* Dark / light toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={cn(
            "tn-sidebar-action",
            isCollapsed && "justify-center px-0"
          )}
        >
          {theme === "dark"
            ? <Sun  className="size-4 shrink-0" />
            : <Moon className="size-4 shrink-0" />}
          {!isCollapsed && (
            <span className="hidden md:inline text-sm">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>

        {/* Sign out */}
        <button
          onClick={logout}
          title="Sign out"
          className={cn(
            "tn-sidebar-action danger",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="size-4 shrink-0" />
          {!isCollapsed && (
            <span className="hidden md:inline text-sm">Sign Out</span>
          )}
        </button>
      </div>
    </div>
  );
};