import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useResetPasswordMutation } from "@/hooks/use-auth";
import { resetPasswordSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import type { z } from "zod";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess,   setIsSuccess]   = useState(false);

  const { mutate: resetPassword, isPending } = useResetPasswordMutation();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    resetPassword(
      { token, ...data },
      {
        onSuccess: () => setIsSuccess(true),
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Password reset failed. The link may have expired."
          );
        },
      }
    );
  };

  /* ── Missing / invalid token ── */
  if (!token) {
    return (
      <div className="tn-auth-root">
        <div className="tn-auth-form-wrap">
          <div className="tn-auth-form-inner">
            <div className="tn-auth-card tn-success-box">
              <div className="tn-error-icon">
                <span style={{ fontSize: "1.35rem", lineHeight: 1 }}>⚠️</span>
              </div>
              <h2 className="tn-auth-heading" style={{ fontSize: "1.2rem" }}>
                Invalid reset link
              </h2>
              <p className="tn-auth-sub" style={{ marginBottom: "1.5rem" }}>
                This password reset link is invalid or has expired.
                Please request a new one.
              </p>
              <Link to="/forgot-password">
                <button className="tn-submit-btn">Request a new link →</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (isSuccess) {
    return (
      <div className="tn-auth-root">
        <div className="tn-auth-form-wrap">
          <div className="tn-auth-form-inner">
            <div className="tn-auth-card tn-success-box">
              <div className="tn-success-icon">
                <CheckCircle className="size-6" style={{ color: "#e8ff47" }} />
              </div>
              <h2 className="tn-auth-heading" style={{ fontSize: "1.25rem" }}>
                Password updated
              </h2>
              <p className="tn-auth-sub" style={{ marginBottom: "1.5rem" }}>
                Your password has been reset successfully. Sign in with your
                new credentials to access your workspace.
              </p>
              <Link to="/sign-in">
                <button className="tn-submit-btn">Sign In →</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tn-auth-root">

      {/* ── Left panel ── */}
      <div className="tn-auth-panel">
        <div className="tn-auth-panel-brand">
          <span className="tn-logo-text" style={{ color: "#f5f4ef" }}>
            TaskNest<span className="tn-logo-dot" />
          </span>
        </div>
        <div className="tn-auth-panel-quote">
          <p className="tn-auth-panel-headline">
            Keep your account<br />
            <em>safe and secure.</em>
          </p>
          <p className="tn-auth-panel-sub">
            Choose a strong, unique password to protect your TaskNest workspace
            and keep your team's data secure.
          </p>
          <div className="tn-auth-panel-chips">
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />End-to-end secure
            </span>
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />Min. 8 characters
            </span>
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />Link expires in 15 min
            </span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="tn-auth-form-wrap">
        <div className="tn-auth-form-inner">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <span className="tn-logo-text dark:text-[#f5f4ef]!">
              TaskNest<span className="tn-logo-dot" />
            </span>
          </div>

          <div className="mb-7">
            <span className="tn-auth-eyebrow">Security</span>
            <h1 className="tn-auth-heading">Set a new password</h1>
            <p className="tn-auth-sub">
              Create a strong password for your TaskNest account.
              This link is single-use and expires in 15 minutes.
            </p>
          </div>

          <div className="tn-auth-card">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="tn-label">New password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNew ? "text" : "password"}
                            placeholder="Min. 8 characters"
                            autoComplete="new-password"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="tn-pw-toggle"
                            onClick={() => setShowNew((v) => !v)}
                          >
                            {showNew
                              ? <EyeOff className="size-[15px]" />
                              : <Eye    className="size-[15px]" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="tn-label">Confirm new password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Repeat your new password"
                            autoComplete="new-password"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="tn-pw-toggle"
                            onClick={() => setShowConfirm((v) => !v)}
                          >
                            {showConfirm
                              ? <EyeOff className="size-[15px]" />
                              : <Eye    className="size-[15px]" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  className="tn-submit-btn"
                  disabled={isPending}
                >
                  {isPending
                    ? <><Loader2 className="size-4 animate-spin" /> Resetting…</>
                    : "Reset Password →"
                  }
                </button>
              </form>
            </Form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Remembered your password?{" "}
              <Link to="/sign-in" className="tn-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;