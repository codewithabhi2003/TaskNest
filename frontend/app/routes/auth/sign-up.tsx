import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSignUpMutation } from "@/hooks/use-auth";
import { signUpSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import type { z } from "zod";

export type SignupFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm,  setShowConfirm]         = useState(false);
  const [isSuccess,    setIsSuccess]           = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const navigate = useNavigate();
  const { mutate: signUp, isPending } = useSignUpMutation();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (data: SignupFormData) => {
    setRegisteredEmail(data.email);
    signUp(data, {
      onSuccess: () => setIsSuccess(true),
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Could not create your account. Please try again."
        );
      },
    });
  };

  /* ── Email confirmation screen ── */
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
                Check your inbox
              </h2>
              <p className="tn-auth-sub" style={{ marginBottom: "1.5rem" }}>
                We've sent a verification link to{" "}
                <strong className="text-foreground">{registeredEmail}</strong>.
                Click the link inside to activate your account.
              </p>
              <button className="tn-submit-btn" onClick={() => navigate("/sign-in")}>
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tn-auth-root">

      {/* ── Left branding panel ── */}
      <div className="tn-auth-panel">
        <div className="tn-auth-panel-brand">
          <span className="tn-logo-text" style={{ color: "#f5f4ef" }}>
            TaskNest<span className="tn-logo-dot" />
          </span>
        </div>

        <div className="tn-auth-panel-quote">
          <p className="tn-auth-panel-headline">
            Set up your workspace<br />
            <em>in under 2 minutes.</em>
          </p>
          <p className="tn-auth-panel-sub">
            No credit card required. No setup fee. Start free and invite your
            whole team — TaskNest scales with you as you grow.
          </p>
          <div className="tn-auth-panel-chips">
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />Free forever plan
            </span>
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />Unlimited tasks
            </span>
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />Invite your team
            </span>
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />No credit card
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
            <span className="tn-auth-eyebrow">Get started — it's free</span>
            <h1 className="tn-auth-heading">Create your account</h1>
            <p className="tn-auth-sub">
              Join thousands of teams organising their work smarter with TaskNest.
            </p>
          </div>

          <div className="tn-auth-card">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="tn-label">Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Smith" autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="tn-label">Work email</FormLabel>
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="tn-label">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 8 characters"
                            autoComplete="new-password"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="tn-pw-toggle"
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword
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
                      <FormLabel className="tn-label">Confirm password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Repeat your password"
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
                    ? <><Loader2 className="size-4 animate-spin" /> Creating account…</>
                    : "Create Account →"
                  }
                </button>
              </form>
            </Form>

            <div className="tn-divider">or</div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/sign-in" className="tn-link">Sign in</Link>
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5 leading-relaxed">
            By creating an account you agree to our{" "}
            <span className="underline underline-offset-2 cursor-pointer">Terms of Service</span>
            {" "}and{" "}
            <span className="underline underline-offset-2 cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;