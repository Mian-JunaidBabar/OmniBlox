import React from "react";
import LoginForm from "./auth/login/page";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
    
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome to OmniBlox</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your all-in-one platform for business automation.
        </p>
        <Link href="/auth/login">
          <Button className="mt-4">Get Started</Button>
        </Link>
      </div>
    </div>
    </>
  );
}

