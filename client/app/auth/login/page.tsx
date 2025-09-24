import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Login</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input type="email" placeholder="Email" required />
            <Input type="password" placeholder="Password" required />
            <Button className="w-full" type="submit">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <a
              href="/auth/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot Password?
            </a>
          </div>
          <div className="mt-2 text-center text-sm">
            <span>Don&apos;t have an account? </span>
            <a href="/auth/signup" className="text-blue-600 hover:underline">
              Sign Up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
