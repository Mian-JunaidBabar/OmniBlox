"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterForm() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl rounded-lg border bg-card text-card-foreground shadow-lg p-6 sm:p-10">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Create Your OmniBlox Workspace
          </h1>
          <p className="mt-2 text-muted-foreground">
            One step away from automating your business.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-10">
          {/* 1. Administrator Account */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold border-b pb-2 mb-4">
              1. Administrator Account
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="e.g., John Doe" />
              </div>
              <div>
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@company.com" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Enter a secure password" />
              </div>
              <div>
                <Label htmlFor="cpassword">Confirm Password</Label>
                <Input id="cpassword" name="cpassword" type="password" placeholder="Retype your password" />
              </div>
            </div>
          </section>

          {/* 2. Business Details */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold border-b pb-2 mb-4">
              2. Business Details
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" name="companyName" placeholder="e.g., JD Retail & Hardware" />
              </div>
              <div>
                <Label htmlFor="workspaceUrl">Workspace URL</Label>
                <div className="mt-2 flex">
                  <Input
                    id="workspaceUrl"
                    name="workspaceUrl"
                    placeholder="your-company"
                    className="rounded-r-none"
                  />
                  <span className="inline-flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                    .omniblox.com
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="industry">Industry / Business Type</Label>
                <Select name="industry">
                  <SelectTrigger id="industry" className="mt-2">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select name="country">
                  <SelectTrigger id="country" className="mt-2">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="gb">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Finalization */}
          <section>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" required />
              <Label htmlFor="terms" className="cursor-pointer text-sm text-muted-foreground">
                I agree to the OmniBlox{" "}
                <Link href="/terms" className="underline hover:text-primary">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-primary">
                  Privacy Policy
                </Link>.
              </Label>
            </div>

            <Button size="lg" className="mt-6 w-full text-sm font-medium" type="submit">
              Continue
            </Button>
          </section>
        </form>

        <p className="mt-8 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
