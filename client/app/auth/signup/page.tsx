"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { signup } from "@/api/auth";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

const roles = ["admin", "manager", "operator", "inventory"];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const data = await signup({ name, email, password, role });
      const createdName = data?.user?.name || name;
      toast.success(
        createdName ? `Welcome, ${createdName}!` : "Account created"
      );
      router.push("/dashboard");
    } catch (error: unknown) {
      let message = "Signup failed";
      if (isAxiosError(error)) {
        message = error.response?.data?.error ?? error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Sign Up</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Select
              required
              value={role}
              onValueChange={(value) => setRole(value)}
            >
              <SelectTrigger className="w-full" aria-label="Select Role">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span>Already have an account? </span>
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
