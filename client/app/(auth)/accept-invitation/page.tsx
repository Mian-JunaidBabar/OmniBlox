"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  User,
  ArrowLeft,
} from "lucide-react";
import { useTeamApi } from "@/hooks/use-team-api";

function AcceptInvitationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const { acceptInvitation } = useTeamApi();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing invitation token");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid invitation token");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await acceptInvitation(token, password, email, name);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to accept invitation. The link may have expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
        <Card className="w-full max-w-md shadow-xl border-border/40">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 shadow-md">
              <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Account Activated!
            </CardTitle>
            <CardDescription className="text-base">
              Your account has been set up successfully. Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <Card className="w-full max-w-md shadow-xl border-border/40">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-md">
            <User className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Join the Team
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Fill in your details to activate your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                <Input
                  id="name"
                  placeholder="John Smith"
                  className="pl-10 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading || !token}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  className="pl-10 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || !token}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                <PasswordInput
                  id="password"
                  placeholder="Create a password"
                  className="pl-10 text-sm font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || !token}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                <PasswordInput
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  className="pl-10 text-sm font-medium"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || !token}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full font-semibold tracking-wide" disabled={isLoading || !token}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Activating...</>
              ) : (
                "Activate Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => router.push("/login")} className="text-sm font-medium">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AcceptInvitationForm />
    </Suspense>
  );
}
