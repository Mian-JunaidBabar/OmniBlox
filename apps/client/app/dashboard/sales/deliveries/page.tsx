"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Truck, Package, CheckCircle } from "lucide-react"
import Link from "next/link"

type Delivery = {
  id: string
  invoiceNumber: string
  customerName: string
  address: string
  date: string
  status: "pending" | "in-transit" | "delivered"
  items: number
}

export default function DeliveriesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const deliveries: Delivery[] = [
    {
      id: "1",
      invoiceNumber: "INV-1001",
      customerName: "Acme Corporation",
      address: "123 Business St, City, State 12345",
      date: "2024-03-20",
      status: "delivered",
      items: 1,
    },
    {
      id: "2",
      invoiceNumber: "INV-1002",
      customerName: "Tech Solutions Inc",
      address: "456 Tech Ave, City, State 67890",
      date: "2024-03-21",
      status: "in-transit",
      items: 1,
    },
    {
      id: "3",
      invoiceNumber: "INV-1003",
      customerName: "Global Enterprises",
      address: "789 Global Blvd, City, State 11223",
      date: "2024-03-22",
      status: "pending",
      items: 1,
    },
  ]

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const pendingCount = deliveries.filter((d) => d.status === "pending").length
  const inTransitCount = deliveries.filter((d) => d.status === "in-transit").length
  const deliveredCount = deliveries.filter((d) => d.status === "delivered").length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/sales">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Deliveries</h1>
          <p className="text-sm text-muted-foreground">Track and manage order deliveries</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting dispatch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-warning">{inTransitCount}</div>
            <p className="text-xs text-muted-foreground">On the way</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-success">{deliveredCount}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Deliveries</CardTitle>
              <CardDescription>View and track delivery status</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search deliveries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Delivery Address</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-mono text-xs">{delivery.invoiceNumber}</TableCell>
                  <TableCell className="font-medium">{delivery.customerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{delivery.address}</TableCell>
                  <TableCell>{new Date(delivery.date).toLocaleDateString()}</TableCell>
                  <TableCell>{delivery.items}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        delivery.status === "delivered"
                          ? "default"
                          : delivery.status === "in-transit"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {delivery.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
