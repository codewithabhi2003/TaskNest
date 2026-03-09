import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForgotPasswordMutation } from "@/hooks/use-auth";
import { forgotPasswordSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, Loader2, MailOpen } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";
import type { z } from "zod";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const { mutate: forgotPassword, isPending } = useForgotPasswordMutation();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setSubmittedEmail(data.email);
    forgotPassword(data, {
      onSuccess: () => setIsSuccess(true),
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Unable to process your request. Please try again."
        );
      },
    });
  };

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
            Regain access to<br />
            <em>your workspace.</em>
          </p>
          <p className="tn-auth-panel-sub">
            Enter your email address and we'll send you a secure link to reset
            your password within minutes.
          </p>
          <div className="tn-auth-panel-chips">
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />Link expires in 15 min
            </span>
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />Secure &amp; encrypted
            </span>
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />No support ticket needed
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
            <span className="tn-auth-eyebrow">Account recovery</span>
            <h1 className="tn-auth-heading">Reset your password</h1>
            <p className="tn-auth-sub">
              We'll send a secure reset link to your registered email address.
            </p>
          </div>

          <div className="tn-auth-card">
            {isSuccess ? (
              <div className="tn-success-box">
                <div className="tn-success-icon">
                  <MailOpen className="size-6" style={{ color: "#e8ff47" }} />
                </div>
                <h2
                  className="tn-auth-heading"
                  style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}
                >
                  Reset link sent
                </h2>
                <p className="tn-auth-sub" style={{ marginBottom: "1.5rem" }}>
                  We've sent a password reset link to{" "}
                  <strong className="text-foreground">{submittedEmail}</strong>.
                  Please check your inbox — the link expires in 15 minutes.
                </p>
                <Link to="/sign-in">
                  <button className="tn-submit-btn">Back to Sign In →</button>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to sign in
                </Link>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      name="email"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="tn-label">Email address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@company.com"
                              autoComplete="email"
                              {...field}
                            />
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
                        ? <><Loader2 className="size-4 animate-spin" /> Sending link…</>
                        : "Send Reset Link →"
                      }
                    </button>
                  </form>
                </Form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;