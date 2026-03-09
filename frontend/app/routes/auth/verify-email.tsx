import { useVerifyEmailMutation } from "@/hooks/use-auth";
import { CheckCircle, Loader, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, isPending: isVerifying } = useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      mutate(
        { token },
        {
          onSuccess: () => setIsSuccess(true),
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message || "Email verification failed."
            );
          },
        }
      );
    }
  }, [token]);

  return (
    <div className="tn-auth-root">
      <div className="tn-auth-form-wrap">
        <div className="tn-auth-form-inner">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <span className="tn-logo-text dark:text-[#f5f4ef]!">
              TaskNest<span className="tn-logo-dot" />
            </span>
          </div>

          <div className="tn-auth-card tn-success-box">
            {isVerifying ? (
              <>
                <div
                  className="flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-4"
                  style={{ background: "var(--muted)" }}
                >
                  <Loader className="size-6 animate-spin text-muted-foreground" />
                </div>
                <h2 className="tn-auth-heading" style={{ fontSize: "1.2rem" }}>
                  Verifying your email
                </h2>
                <p className="tn-auth-sub">
                  Please wait while we verify your email address…
                </p>
              </>
            ) : isSuccess ? (
              <>
                <div className="tn-success-icon">
                  <CheckCircle className="size-6" style={{ color: "#e8ff47" }} />
                </div>
                <h2 className="tn-auth-heading" style={{ fontSize: "1.2rem" }}>
                  Email verified
                </h2>
                <p className="tn-auth-sub" style={{ marginBottom: "1.5rem" }}>
                  Your email address has been verified successfully.
                  You can now sign in to your TaskNest workspace.
                </p>
                <Link to="/sign-in">
                  <button className="tn-submit-btn">Sign In →</button>
                </Link>
              </>
            ) : (
              <>
                <div className="tn-error-icon">
                  <XCircle className="size-6 text-destructive" />
                </div>
                <h2 className="tn-auth-heading" style={{ fontSize: "1.2rem" }}>
                  Verification failed
                </h2>
                <p className="tn-auth-sub" style={{ marginBottom: "1.5rem" }}>
                  This verification link is invalid or has expired.
                  Please sign up again or contact support if the issue persists.
                </p>
                <Link to="/sign-up">
                  <button className="tn-submit-btn">Back to Sign Up →</button>
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;