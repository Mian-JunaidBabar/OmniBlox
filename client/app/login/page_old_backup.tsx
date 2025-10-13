"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add any validation here if needed
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-lg p-6 sm:p-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to your OmniBlox workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Email */}
          <div>
            <Label className="mb-2" htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <Label className="mb-2" htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label
                htmlFor="remember"
                className="cursor-pointer text-sm font-normal text-muted-foreground"
              >
                Remember me
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <Button type="submit" size="lg" className="w-full text-lg font-medium">
            Log In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
