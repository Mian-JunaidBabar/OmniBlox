"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Printer, Download } from "lucide-react"

export default function ReturnDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [returnData] = useState({
    id: params.id,
    reference: `RET-${String(params.id).padStart(5, "0")}`,
    date: "2024-01-20",
    type: "customer",
    customer: "Acme Corporation",
    originalSale: "SAL-00123",
    status: "approved",
    items: [
      {
        id: 1,
        product: "Laptop Dell XPS 15",
        sku: "LAP-001",
        quantity: 2,
        unitPrice: 1500,
        reason: "Defective",
        subtotal: 3000,
      },
    ],
    subtotal: 3000,
    taxAmount: 300,
    total: 3300,
    notes: "Customer reported screen flickering issue",
    refundMethod: "Original Payment Method",
    refundStatus: "processed",
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Return {returnData.reference}</h1>
            <p className="text-muted-foreground">View return details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button size="sm" onClick={() => router.push(`/returns/${params.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Return Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reference</p>
                <p className="text-base font-semibold">{returnData.reference}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-base">{new Date(returnData.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <Badge>{returnData.type}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                <p className="text-base">{returnData.customer}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Original Sale</p>
                <p className="text-base">{returnData.originalSale}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={returnData.status === "approved" ? "default" : "secondary"}>{returnData.status}</Badge>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Returned Items</h3>
              <div className="space-y-3">
                {returnData.items.map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{item.product}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          Qty: {item.quantity} × ${item.unitPrice}
                        </p>
                        <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.reason}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${returnData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">${returnData.taxAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total Refund</span>
                <span className="font-bold">${returnData.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Refund Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Refund Method</p>
                <p className="text-base">{returnData.refundMethod}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Refund Status</p>
                <Badge variant={returnData.refundStatus === "processed" ? "default" : "secondary"}>
                  {returnData.refundStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{returnData.notes}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
