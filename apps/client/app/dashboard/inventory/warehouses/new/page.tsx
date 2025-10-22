"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewWarehousePage() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/inventory/warehouses")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory/warehouses">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Warehouse</h1>
          <p className="text-muted-foreground">Create a new warehouse location</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Information</CardTitle>
            <CardDescription>Enter the warehouse details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Warehouse Name</Label>
                <Input id="name" placeholder="Main Warehouse" required />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="code">Warehouse Code</Label>
                <Input id="code" placeholder="WH-001" required />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="capacity">Capacity (units)</Label>
                <Input id="capacity" type="number" placeholder="10000" required />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Enter full address" rows={3} required />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="New York" required />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="state">State/Province</Label>
                <Input id="state" placeholder="NY" required />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="zip">ZIP/Postal Code</Label>
                <Input id="zip" placeholder="10001" required />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional information about this warehouse" rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/inventory/warehouses">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">Create Warehouse</Button>
        </div>
      </form>
    </div>
  )
}
