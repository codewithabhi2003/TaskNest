import { workspaceSchema } from "@/lib/schema";
import { colorOptions } from "@/components/workspace/create-workspace";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSearchParams, useNavigate } from "react-router";
import { useGetWorkspaceDetailsQuery, useUpdateWorkspaceMutation } from "@/hooks/use-workspace";
import { updateData, deleteData } from "@/lib/fetch-util";
import { Loader } from "@/components/loader";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Check,
  Loader2,
  Palette,
  Settings2,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useState } from "react";

type WorkspaceForm = z.infer<typeof workspaceSchema>;

/* ─── Section wrapper ───────────────────────────────────── */
const Section = ({
  icon,
  title,
  description,
  children,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  danger?: boolean;
}) => (
  <div
    className={cn(
      "rounded-2xl border bg-card overflow-hidden",
      danger && "border-red-500/40"
    )}
  >
    {/* header */}
    <div
      className={cn(
        "flex items-start gap-3 px-6 py-5 border-b",
        danger ? "bg-red-500/5 border-red-500/20" : "bg-muted/30"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          danger
            ? "bg-red-500/10 text-red-500"
            : "bg-[rgba(232,255,71,0.1)] text-foreground"
        )}
        style={danger ? {} : { border: "1px solid rgba(232,255,71,0.25)" }}
      >
        {icon}
      </div>
      <div>
        <p
          className={cn(
            "text-sm font-semibold",
            danger && "text-red-500"
          )}
        >
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>

    <div className="px-6 py-5">{children}</div>
  </div>
);

/* ─── Delete confirm dialog ─────────────────────────────── */
const DeleteConfirm = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
  <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
    <p className="text-sm font-medium text-foreground">
      Are you sure? This action is <span className="text-red-500 font-semibold">permanent</span> and cannot be undone.
    </p>
    <p className="text-xs text-muted-foreground">
      All projects, tasks, members and activity in this workspace will be permanently deleted.
    </p>
    <div className="flex gap-2 pt-1">
      <button
        onClick={onConfirm}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
      >
        <Trash2 className="size-3" /> Yes, delete workspace
      </button>
      <button
        onClick={onCancel}
        className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted transition-colors"
      >
        Cancel
      </button>
    </div>
  </div>
);

/* ─── Main ──────────────────────────────────────────────── */
export default function Settings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workspaceId = searchParams.get("workspaceId");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: workspace, isLoading } =
    useGetWorkspaceDetailsQuery(workspaceId!) as any;

  const form = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    values: {
      name: workspace?.name || "",
      description: workspace?.description || "",
      color: workspace?.color || colorOptions[0],
    },
  });

  const { mutate: updateWorkspace, isPending } = useUpdateWorkspaceMutation();

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader />
    </div>
  );

  const onSubmit = (data: WorkspaceForm) => {
    updateWorkspace(
      { workspaceId: workspaceId!, name: data.name, description: data.description ?? "", color: data.color },
      {
        onSuccess: (updated: any) => {
          toast.success("Workspace updated");
          window.dispatchEvent(new CustomEvent("workspace-updated", { detail: updated }));
          navigate(`/workspaces/${workspaceId}`);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Update failed");
        },
      }
    );
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteData(`/workspaces/${workspaceId}`);
      toast.success("Workspace deleted");
      navigate("/workspaces");
    } catch {
      toast.error("Delete failed");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleTransfer = async (newOwnerId: string) => {
    try {
      await updateData(`/workspaces/${workspaceId}/transfer`, { newOwnerId });
      toast.success("Ownership transferred");
    } catch {
      toast.error("Transfer failed");
    }
  };

  const selectedColor = form.watch("color");

  return (
    <div className="space-y-6">

      {/* ── Page heading ── */}
      <div>
        <p
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1"
          style={{ letterSpacing: "0.13em" }}
        >
          {workspace?.name}
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
          Workspace Settings
        </h1>
      </div>

      {/* ── Sections — centered with max width ── */}
      <div className="max-w-2xl mx-auto space-y-6">

      {/* ── General ── */}
      <Section
        icon={<Settings2 className="size-4" />}
        title="General"
        description="Update your workspace name, description and accent colour."
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Workspace Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Acme Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What does this workspace focus on?"
                      rows={3}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Accent Colour
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3 flex-wrap">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => field.onChange(color)}
                          className={cn(
                            "relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150",
                            field.value === color
                              ? "ring-2 ring-offset-2 ring-foreground scale-110"
                              : "hover:scale-105 opacity-80 hover:opacity-100"
                          )}
                          style={{ backgroundColor: color }}
                        >
                          {field.value === color && (
                            <Check className="size-3.5 text-white drop-shadow" strokeWidth={3} />
                          )}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="tn-submit-btn"
                style={{ width: "auto", padding: "9px 24px", fontSize: "0.85rem" }}
              >
                {isPending
                  ? <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
                  : "Save Changes"
                }
              </button>
            </div>
          </form>
        </Form>
      </Section>

      {/* ── Transfer ── */}
      <Section
        icon={<UserCheck className="size-4" />}
        title="Transfer Ownership"
        description="Assign workspace ownership to another member. You will lose owner privileges."
      >
        <div className="space-y-3">
          <Select onValueChange={handleTransfer}>
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Select a member…" />
            </SelectTrigger>
            <SelectContent>
              {workspace?.members?.map((member: any) => (
                <SelectItem key={member.user._id} value={member.user._id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-[#0d0f14]"
                      style={{ background: "#e8ff47" }}
                    >
                      {member.user.name.charAt(0).toUpperCase()}
                    </span>
                    {member.user.name}
                    <span className="text-xs text-muted-foreground capitalize">({member.role})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            This action is immediate. Make sure you trust the selected member.
          </p>
        </div>
      </Section>

      {/* ── Danger zone ── */}
      <Section
        icon={<AlertTriangle className="size-4" />}
        title="Danger Zone"
        description="Permanently delete this workspace and all its data."
        danger
      >
        {showDeleteConfirm ? (
          <DeleteConfirm
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium">Delete this workspace</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Once deleted, all projects and tasks are gone forever.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/40 bg-red-500/8 text-red-500 text-sm font-semibold hover:bg-red-500/15 transition-colors"
            >
              <Trash2 className="size-3.5" /> Delete Workspace
            </button>
          </div>
        )}
      </Section>

      </div>
    </div>
  );
}