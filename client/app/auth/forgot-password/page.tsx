"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { forgotPassword, resetPassword } from "@/api/auth";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await forgotPassword(email);
      toast.success("If the email exists, an OTP was sent");
      setStep("reset");
    } catch (error: unknown) {
      let message = "Failed to send OTP";
      if (isAxiosError(error))
        message = error.response?.data?.error ?? error.message;
      else if (error instanceof Error) message = error.message;
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await resetPassword({ email, otp, newPassword });
      toast.success("Password updated. You can login now.");
      router.push("/auth/login");
    } catch (error: unknown) {
      let message = "Failed to reset password";
      if (isAxiosError(error))
        message = error.response?.data?.error ?? error.message;
      else if (error instanceof Error) message = error.message;
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        </CardHeader>
        <CardContent>
          {step === "request" ? (
            <form className="space-y-4" onSubmit={handleRequest}>
              <Input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button className="w-full" type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleReset}>
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <Input
                type="password"
                placeholder="New password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button className="w-full" type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Back to Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
