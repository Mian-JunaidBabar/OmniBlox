"use client";

import React from "react";
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

export default function PaymentPage() {
  function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    // Handle payment + final account creation
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-500 max-w-2xl rounded-lg border bg-card text-card-foreground shadow-lg p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">
          Payment Details
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          Choose a plan and enter your payment info.
        </p>

        <form onSubmit={handlePayment} className="mt-8 space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="plan">Choose a Plan</Label>
              <Select name="plan">
                <SelectTrigger id="plan" className="mt-2">
                  <SelectValue placeholder="Select your plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic – $17 / month</SelectItem>
                  <SelectItem value="business">Business – $23 / month</SelectItem>
                  <SelectItem value="enterprise">Enterprise – $30 / month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="billing-cycle">Billing Cycle</Label>
              <Select name="billing-cycle">
                <SelectTrigger id="billing-cycle" className="mt-2">
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annually">Annually (Save 20%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 rounded-md border bg-background p-4">
            <div>
              <Label className="mb-2" htmlFor="card-name">Name on Card</Label>
              <Input id="card-name" placeholder="John Doe" />
            </div>
            <div>
              <Label className="mb-2" htmlFor="card-number">Card Number</Label>
              <Input id="card-number" placeholder="•••• •••• •••• ••••" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="card-expiry">Expiry Date</Label>
                <Input id="card-expiry" placeholder="MM / YY" />
              </div>
              <div>
                <Label className="mb-2" htmlFor="card-cvc">CVC</Label>
                <Input id="card-cvc" placeholder="123" />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Complete Registration
          </Button>
        </form>
      </div>
    </div>
  );
}
