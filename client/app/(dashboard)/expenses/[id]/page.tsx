"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Printer, Download } from "lucide-react"

export default function ExpenseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [expense] = useState({
    id: params.id,
    reference: `EXP-${String(params.id).padStart(5, "0")}`,
    date: "2024-01-15",
    category: "Office Supplies",
    vendor: "Office Depot",
    amount: 450.0,
    paymentMethod: "Credit Card",
    status: "approved",
    description: "Monthly office supplies purchase including paper, pens, and folders",
    attachments: ["receipt.pdf"],
    approvedBy: "John Manager",
    approvedDate: "2024-01-16",
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expense {expense.reference}</h1>
            <p className="text-muted-foreground">View expense details</p>
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
          <Button size="sm" onClick={() => router.push(`/expenses/${params.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Expense Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reference</p>
                <p className="text-base font-semibold">{expense.reference}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-base">{new Date(expense.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="text-base">{expense.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                <p className="text-base">{expense.vendor}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                <p className="text-base">{expense.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={expense.status === "approved" ? "default" : "secondary"}>{expense.status}</Badge>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
              <p className="text-base">{expense.description}</p>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Total Amount</span>
              <span className="font-bold text-2xl">${expense.amount.toFixed(2)}</span>
            </div>

            {expense.status === "approved" && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                    <p className="text-base">{expense.approvedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved Date</p>
                    <p className="text-base">{new Date(expense.approvedDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expense.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{file}</span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
