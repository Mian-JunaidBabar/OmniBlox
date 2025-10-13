"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, ShoppingCart, DollarSign, TrendingDown } from "lucide-react"
import Link from "next/link"

type Purchase = {
  id: string
  purchaseNumber: string
  supplierName: string
  date: string
  dueDate: string
  status: "draft" | "pending" | "paid" | "overdue"
  subtotal: number
  tax: number
  total: number
}

export default function PurchasesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const purchases: Purchase[] = [
    {
      id: "1",
      purchaseNumber: "PO-1001",
      supplierName: "Tech Supplies Co",
      date: "2024-03-15",
      dueDate: "2024-04-15",
      status: "paid",
      subtotal: 5000,
      tax: 500,
      total: 5500,
    },
    {
      id: "2",
      purchaseNumber: "PO-1002",
      supplierName: "Office Depot",
      date: "2024-03-18",
      dueDate: "2024-04-18",
      status: "pending",
      subtotal: 1200,
      tax: 120,
      total: 1320,
    },
    {
      id: "3",
      purchaseNumber: "PO-1003",
      supplierName: "Hardware Solutions",
      date: "2024-03-10",
      dueDate: "2024-03-25",
      status: "overdue",
      subtotal: 3500,
      tax: 350,
      total: 3850,
    },
  ]

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.supplierName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalSpent = purchases.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.total, 0)
  const pendingAmount = purchases.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.total, 0)
  const overdueAmount = purchases.filter((p) => p.status === "overdue").reduce((sum, p) => sum + p.total, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Purchases</h1>
          <p className="text-sm text-muted-foreground">Manage your purchase orders and supplier invoices</p>
        </div>
        <Link href="/purchases/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Purchase
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{purchases.length}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Paid purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-warning">${pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-destructive">${overdueAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Purchases</CardTitle>
              <CardDescription>View and manage your purchase orders</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search purchases..."
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
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-mono text-xs">{purchase.purchaseNumber}</TableCell>
                  <TableCell className="font-medium">{purchase.supplierName}</TableCell>
                  <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(purchase.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-semibold">${purchase.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        purchase.status === "paid"
                          ? "default"
                          : purchase.status === "overdue"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {purchase.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/purchases/${purchase.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/purchases/${purchase.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
