"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewReturnPage() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/returns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">New Return</h1>
          <p className="text-sm text-muted-foreground">
            Select the type of return you want to create
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
            onClick={() => router.push("/returns/new/customer")}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-2xl">Customer Return</CardTitle>
              </div>
              <CardDescription className="text-base">
                Process returns from customers for sales transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Return products sold to customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Add items back to inventory</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Issue refunds or credit notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Track return reasons and conditions</span>
                </li>
              </ul>
              <Button className="w-full mt-6">Create Customer Return</Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
            onClick={() => router.push("/returns/new/supplier")}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl">Supplier Return</CardTitle>
              </div>
              <CardDescription className="text-base">
                Return products back to suppliers for purchase orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Return defective or incorrect items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Remove items from inventory</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Request refund or replacement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Document quality issues</span>
                </li>
              </ul>
              <Button className="w-full mt-6">Create Supplier Return</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-muted-foreground">
            Choose <strong>Customer Return</strong> if you&apos;re processing a
            return from a customer who purchased from you. Choose{" "}
            <strong>Supplier Return</strong> if you&apos;re returning products
            back to your supplier.
          </p>
        </div>
      </div>
    </div>
  );
}
