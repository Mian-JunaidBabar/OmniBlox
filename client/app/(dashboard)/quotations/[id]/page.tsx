"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Printer, Mail, Download, FileText } from "lucide-react"

export default function QuotationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [quotation] = useState({
    id: params.id,
    reference: `QUO-${String(params.id).padStart(5, "0")}`,
    date: "2024-01-15",
    validUntil: "2024-02-15",
    customer: "Acme Corporation",
    status: "sent",
    items: [
      { id: 1, product: "Laptop Dell XPS 15", sku: "LAP-001", quantity: 10, unitPrice: 1500, tax: 10, subtotal: 16500 },
      { id: 2, product: "Wireless Mouse", sku: "MOU-001", quantity: 10, unitPrice: 30, tax: 10, subtotal: 330 },
    ],
    subtotal: 15300,
    taxAmount: 1530,
    discount: 500,
    total: 16330,
    notes: "Special corporate pricing applied. Free shipping included.",
    terms: "Payment due within 30 days of invoice date.",
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quotation {quotation.reference}</h1>
            <p className="text-muted-foreground">View and manage quotation details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Convert to Sale
          </Button>
          <Button size="sm" onClick={() => router.push(`/quotations/${params.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quotation Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reference</p>
                <p className="text-base font-semibold">{quotation.reference}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-base">{new Date(quotation.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                <p className="text-base">{quotation.customer}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valid Until</p>
                <p className="text-base">{new Date(quotation.validUntil).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={quotation.status === "sent" ? "default" : "secondary"}>{quotation.status}</Badge>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Items</h3>
              <div className="space-y-3">
                {quotation.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.product}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm">
                        Qty: {item.quantity} × ${item.unitPrice}
                      </p>
                      <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${quotation.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">${quotation.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-green-600">-${quotation.discount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold">${quotation.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{quotation.notes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{quotation.terms}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
