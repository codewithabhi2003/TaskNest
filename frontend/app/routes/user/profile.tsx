import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  useChangePassword,
  useUpdateUserProfile,
  useUserProfileQuery,
} from "@/hooks/use-user";
import { useAuth } from "@/provider/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  UserCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

/* ─── schemas ─────────────────────────────────────────── */
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword:     z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type ProfileFormData        = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof passwordSchema>;

/* ─── helpers ──────────────────────────────────────────── */
const avatarColour = (name: string) => {
  const palette = ["#e8ff47","#a78bfa","#34d399","#60a5fa","#f472b6","#fb923c"];
  return palette[(name?.charCodeAt(0) ?? 0) % palette.length];
};

const MAX_SIZE_MB = 2;

/* ─── component ────────────────────────────────────────── */
const Profile = () => {
  const { user } = useAuth();
  const { data: profile } = useUserProfileQuery();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateUserProfile();
  const { mutate: changePassword, isPending: isChanging } = useChangePassword();

  /* avatar upload state */
  const fileInputRef               = useRef<HTMLInputElement>(null);
  const [preview,     setPreview]    = useState<string | null>(null);
  const [savedAvatar, setSavedAvatar] = useState<string | null>(null); // holds base64 after save until query refetches
  const [avatarFile,  setAvatarFile]  = useState<File | null>(null);

  /* password toggles */
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* profile form */
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "" },
  });
  useEffect(() => {
    if (profile?.name) profileForm.reset({ name: profile.name });
  }, [profile]);

  // Once the server returns the updated picture, drop the local savedAvatar
  useEffect(() => {
    if (savedAvatar && profile?.profilePicture === savedAvatar) {
      setSavedAvatar(null);
    }
  }, [profile?.profilePicture, savedAvatar]);

  /* password form */
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  /* ── avatar handlers ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WebP, etc.)");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_SIZE_MB} MB`);
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    /* reset so the same file can be re-selected if user cancels */
    e.target.value = "";
  };



  /* ── profile submit — includes avatar if a new one was selected ── */
  const onProfileSubmit = (data: ProfileFormData) => {
    const payload: any = { ...data };
    if (preview) payload.profilePicture = preview;

    updateProfile(payload, {
      onSuccess: () => {
        toast.success("Profile updated successfully.");
        setSavedAvatar(preview);  // keep showing new image immediately
        setPreview(null);
        setAvatarFile(null);
      },
      onError: () => toast.error("Failed to update profile. Please try again."),
    });
  };

  /* ── password submit ── */
  const onPasswordSubmit = (data: ChangePasswordFormData) => {
    changePassword(data, {
      onSuccess: () => {
        toast.success("Password changed successfully.");
        passwordForm.reset();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to change password.");
      },
    });
  };

  // preview > savedAvatar (post-save, pre-refetch) > fresh profile from server
  const displayAvatar = preview ?? savedAvatar ?? profile?.profilePicture ?? "";
  const bg             = avatarColour(profile?.name ?? "U");

  return (
    <div className="space-y-6">

      {/* ── Page heading (left-aligned, full width) ── */}
      <div>
        <p
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1"
          style={{ letterSpacing: "0.13em" }}
        >
          Account
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
          Profile &amp; Security
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information and account security settings.
        </p>
      </div>

      {/* ── Sections centered ── */}
      <div className="max-w-2xl space-y-6">

        {/* ── Profile details ── */}
        <section className="rounded-2xl border bg-card overflow-hidden">
          {/* section header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/30">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "rgba(232,255,71,0.1)", border: "1px solid rgba(232,255,71,0.25)" }}
            >
              <UserCircle className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Personal Information</p>
              <p className="text-xs text-muted-foreground">Update your name and profile picture</p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-6">

            {/* ── Avatar upload area ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* clickable avatar */}
              <div className="relative shrink-0 group">
                <Avatar
                  className="size-20 ring-2 ring-border cursor-pointer transition-all group-hover:ring-[rgba(232,255,71,0.5)]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AvatarImage src={displayAvatar} alt={profile?.name} />
                  <AvatarFallback
                    className="text-2xl font-bold"
                    style={{ background: bg, color: "#0d0f14" }}
                  >
                    {profile?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>

                {/* camera overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="size-5 text-white" />
                </button>

                {/* preview badge */}
                {preview && (
                  <span
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold"
                    style={{ background: "#e8ff47", color: "#0d0f14" }}
                  >
                    ●
                  </span>
                )}
              </div>

              {/* upload actions */}
              <div className="space-y-2">
                <p className="text-sm font-medium">{profile?.name}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted transition-colors"
                    >
                      <Camera className="size-3" /> Change photo
                    </button>
                    {preview ? (
                      <p className="text-[10px] font-medium" style={{ color: "#e8ff47" }}>
                        ● New photo selected — click Save Changes
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground">
                        JPG, PNG or WebP · Max {MAX_SIZE_MB} MB
                      </p>
                    )}
                  </div>
              </div>

              {/* hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* divider */}
            <div className="border-t" />

            {/* ── Name / email form ── */}
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Display name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* read-only email */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                    Email address
                  </label>
                  <Input value={profile?.email ?? ""} disabled className="opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Your email address cannot be changed.
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="tn-submit-btn"
                    style={{ width: "auto", padding: "9px 24px", fontSize: "0.85rem" }}
                    disabled={isUpdating}
                  >
                    {isUpdating
                      ? <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
                      : "Save Changes"
                    }
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </section>

        {/* ── Change password ── */}
        <section className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/30">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "rgba(232,255,71,0.1)", border: "1px solid rgba(232,255,71,0.25)" }}
            >
              <KeyRound className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Change Password</p>
              <p className="text-xs text-muted-foreground">Keep your account secure with a strong password</p>
            </div>
          </div>

          <div className="px-6 py-5">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">

                {[
                  { name: "currentPassword" as const, label: "Current password",    show: showCurrent, toggle: () => setShowCurrent(v => !v), placeholder: "Enter your current password",  ac: "current-password" },
                  { name: "newPassword"     as const, label: "New password",         show: showNew,     toggle: () => setShowNew(v => !v),     placeholder: "Min. 8 characters",            ac: "new-password"     },
                  { name: "confirmPassword" as const, label: "Confirm new password", show: showConfirm, toggle: () => setShowConfirm(v => !v), placeholder: "Repeat your new password",     ac: "new-password"     },
                ].map(({ name, label, show, toggle, placeholder, ac }) => (
                  <FormField
                    key={name}
                    control={passwordForm.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {label}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={show ? "text" : "password"}
                              placeholder={placeholder}
                              autoComplete={ac}
                              className="pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              className="tn-pw-toggle"
                              onClick={toggle}
                            >
                              {show
                                ? <EyeOff className="size-[15px]" />
                                : <Eye    className="size-[15px]" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="tn-submit-btn"
                    style={{ width: "auto", padding: "9px 24px", fontSize: "0.85rem" }}
                    disabled={isChanging}
                  >
                    {isChanging
                      ? <><Loader2 className="size-3.5 animate-spin" /> Updating…</>
                      : "Update Password"
                    }
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Profile;