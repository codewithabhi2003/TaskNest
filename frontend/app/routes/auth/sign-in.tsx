import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/hooks/use-auth";
import { signInSchema } from "@/lib/schema";
import { useAuth } from "@/provider/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import type { z } from "zod";

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { mutate: loginUser, isPending } = useLoginMutation();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: SignInFormData) => {
    loginUser(data, {
      onSuccess: async (response: any) => {
        await login(response);
        const redirect = sessionStorage.getItem("redirectAfterLogin");
        if (redirect) {
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(redirect, { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Invalid email or password. Please try again."
        );
      },
    });
  };

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
            Your team's work,<br />
            <em>finally in one place.</em>
          </p>
          <p className="tn-auth-panel-sub">
            Thousands of teams ship faster, stay aligned, and deliver better
            results with TaskNest — the workspace built for clarity and speed.
          </p>
          <div className="tn-auth-panel-chips">
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />Kanban &amp; sprints
            </span>
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />Real-time activity
            </span>
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />Visual analytics
            </span>
            <span className="tn-auth-chip">
              <span className="tn-auth-chip-dot" />Team collaboration
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

          {/* Heading */}
          <div className="mb-7">
            <span className="tn-auth-eyebrow">Welcome back</span>
            <h1 className="tn-auth-heading">Sign in to your workspace</h1>
            <p className="tn-auth-sub">
              Pick up where you left off. Your projects and tasks are waiting.
            </p>
          </div>

          {/* Form card */}
          <div className="tn-auth-card">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <FormField
                  control={form.control}
                  name="email"
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-1.5">
                        <FormLabel className="tn-label" style={{ marginBottom: 0 }}>
                          Password
                        </FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            autoComplete="current-password"
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

                <button
                  type="submit"
                  className="tn-submit-btn"
                  disabled={isPending}
                >
                  {isPending
                    ? <><Loader2 className="size-4 animate-spin" /> Signing in…</>
                    : "Sign In →"
                  }
                </button>
              </form>
            </Form>

            <div className="tn-divider">or</div>

            <p className="text-center text-sm text-muted-foreground">
              New to TaskNest?{" "}
              <Link to="/sign-up" className="tn-link">
                Create a free account
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5 leading-relaxed">
            By signing in you agree to our{" "}
            <span className="underline underline-offset-2 cursor-pointer">Terms of Service</span>
            {" "}and{" "}
            <span className="underline underline-offset-2 cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;