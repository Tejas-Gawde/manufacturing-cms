import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input type="email" placeholder="Enter your email" required />
            <Button className="w-full" type="submit">
              Send OTP
            </Button>
          </form>
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
