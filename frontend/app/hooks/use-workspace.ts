import type { Workspace } from "@/types";
import type { WorkspaceForm } from "@/components/workspace/create-workspace";

import { fetchData, postData, updateData } from "@/lib/fetch-util";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/* =============================
   CREATE WORKSPACE
============================= */
export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkspaceForm) =>
      postData<Workspace>("/workspaces", data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

/* =============================
   GET ALL WORKSPACES
============================= */
export const useGetWorkspacesQuery = () => {
  return useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => fetchData<Workspace[]>("/workspaces"),
  });
};

/* =============================
   GET WORKSPACE + PROJECTS
============================= */
export const useGetWorkspaceQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () =>
      fetchData(`/workspaces/${workspaceId}/projects`),
    enabled: !!workspaceId,
  });
};

/* =============================
   GET WORKSPACE STATS
============================= */
export const useGetWorkspaceStatsQuery = (workspaceId?: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "stats"],
    queryFn: async () =>
      fetchData(`/workspaces/${workspaceId}/stats`),
    enabled: !!workspaceId,
  });
};

/* =============================
   GET WORKSPACE DETAILS
============================= */
export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
  return useQuery<Workspace>({
    queryKey: ["workspace", workspaceId, "details"],
    queryFn: async () =>
      fetchData<Workspace>(`/workspaces/${workspaceId}`),
    enabled: !!workspaceId,
  });
};

/* =============================
   UPDATE WORKSPACE
============================= */
export const useUpdateWorkspaceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      workspaceId: string;
      name: string;
      description: string;
      color: string;
    }) =>
      updateData<Workspace>(`/workspaces/${data.workspaceId}`, {
        name: data.name,
        description: data.description,
        color: data.color,
      }),

    onSuccess: (_, variables) => {
      // 🔥 This makes header update instantly
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId, "details"],
      });
    },
  });
};

/* =============================
   INVITE MEMBER
============================= */
export const useInviteMemberMutation = () => {
  return useMutation({
    mutationFn: (data: {
      email: string;
      role: string;
      workspaceId: string;
    }) =>
      postData(`/workspaces/${data.workspaceId}/invite-member`, data),
  });
};

/* =============================
   ACCEPT INVITE TOKEN
============================= */
export const useAcceptInviteByTokenMutation = () => {
  return useMutation({
    mutationFn: (token: string) =>
      postData(`/workspaces/accept-invite-token`, { token }),
  });
};

/* =============================
   ACCEPT GENERATED INVITE
============================= */
export const useAcceptGenerateInviteMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData(`/workspaces/${workspaceId}/accept-generate-invite`, {}),
  });
};