"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Printer, Download, Mail } from "lucide-react"
import Link from "next/link"
import { mockInvoices } from "@/lib/mock-data"
import { use } from "react"

export default function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const invoice = mockInvoices.find((i) => i.id === id)

  if (!invoice) {
    return <div className="p-6">Invoice not found</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sales">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{invoice.invoiceNumber}</h1>
            <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Mail className="h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Link href={`/sales/${id}/edit`}>
            <Button size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>Complete invoice information</CardDescription>
              </div>
              <Badge
                variant={
                  invoice.status === "paid" ? "default" : invoice.status === "overdue" ? "destructive" : "secondary"
                }
              >
                {invoice.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invoice Number</p>
                <p className="text-sm font-mono">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                <p className="text-sm font-medium">{invoice.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invoice Date</p>
                <p className="text-sm">{new Date(invoice.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                <p className="text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">${invoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-semibold">${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge
                  variant={
                    invoice.status === "paid" ? "default" : invoice.status === "overdue" ? "destructive" : "secondary"
                  }
                  className="mt-1"
                >
                  {invoice.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount Due</p>
                <p className="text-2xl font-semibold mt-1">
                  ${invoice.status === "paid" ? "0.00" : invoice.total.toFixed(2)}
                </p>
              </div>
              {invoice.status !== "paid" && <Button className="w-full">Mark as Paid</Button>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-semibold">{invoice.items.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Units</p>
                <p className="text-2xl font-semibold">{invoice.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
