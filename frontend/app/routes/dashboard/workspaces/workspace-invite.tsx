import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";

import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/provider/auth-context";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { WorkspaceAvatar } from "@/components/workspace/workspace-avatar";

import {
  useAcceptGenerateInviteMutation,
  useAcceptInviteByTokenMutation,
  useGetWorkspaceDetailsQuery,
} from "@/hooks/use-workspace";

import type { Workspace } from "@/types";

const WorkspaceInvite = () => {
  const { workspaceId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("tk");

  const navigate = useNavigate();

  const { isAuthenticated, isLoading } = useAuth();

  /**
   * Redirect to login if user is not authenticated
   */
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      sessionStorage.setItem(
        "redirectAfterLogin",
        window.location.pathname + window.location.search
      );

      navigate("/sign-in", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (!workspaceId) {
    return <div>Workspace not found</div>;
  }

  /**
   * Fetch workspace details
   */
  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
  } = useGetWorkspaceDetailsQuery(workspaceId) as {
    data: Workspace;
    isLoading: boolean;
  };

  /**
   * Mutations
   */
  const {
    mutate: acceptInviteByToken,
    isPending: isAcceptInviteByTokenPending,
  } = useAcceptInviteByTokenMutation();

  const {
    mutate: acceptGenerateInvite,
    isPending: isAcceptGenerateInvitePending,
  } = useAcceptGenerateInviteMutation();

  /**
   * Accept invitation
   */
  const handleAcceptInvite = () => {
    if (!workspaceId) return;

    if (token) {
      acceptInviteByToken(token, {
        onSuccess: () => {
          toast.success("Invitation accepted");
          navigate(`/workspaces/${workspaceId}`);
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to accept invite"
          );
        },
      });
    } else {
      acceptGenerateInvite(workspaceId, {
        onSuccess: () => {
          toast.success("Invitation accepted");
          navigate(`/workspaces/${workspaceId}`);
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to accept invite"
          );
        },
      });
    }
  };

  /**
   * Decline invitation
   */
  const handleDeclineInvite = () => {
    toast.info("Invitation declined");
    navigate("/workspaces");
  };

  /**
   * Loading state
   */
  if (isLoading || isWorkspaceLoading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  /**
   * Invalid invite
   */
  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This workspace invitation is invalid or has expired.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              onClick={() => navigate("/workspaces")}
              className="w-full"
            >
              Go to Workspaces
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Main UI
   */
  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <WorkspaceAvatar
              name={workspace.name}
              color={workspace.color}
            />
            <CardTitle>{workspace.name}</CardTitle>
          </div>

          <CardDescription>
            You've been invited to join the{" "}
            <strong>{workspace.name}</strong> workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {workspace.description && (
            <p className="text-sm text-muted-foreground">
              {workspace.description}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="default"
              className="flex-1"
              onClick={handleAcceptInvite}
              disabled={
                isAcceptInviteByTokenPending ||
                isAcceptGenerateInvitePending
              }
            >
              {isAcceptInviteByTokenPending ||
              isAcceptGenerateInvitePending
                ? "Joining..."
                : "Accept Invitation"}
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDeclineInvite}
              disabled={
                isAcceptInviteByTokenPending ||
                isAcceptGenerateInvitePending
              }
            >
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceInvite;