"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

export default function EditReturnPage() {
  const params = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    reference: `RET-${String(params.id).padStart(5, "0")}`,
    date: "2024-01-20",
    type: "customer",
    customer: "Acme Corporation",
    originalSale: "SAL-00123",
    status: "approved",
    notes: "Customer reported screen flickering issue",
    refundMethod: "Original Payment Method",
    refundStatus: "processed",
  })

  const [items, setItems] = useState([
    { id: 1, product: "Laptop Dell XPS 15", quantity: 2, unitPrice: 1500, reason: "Defective" },
  ])

  const addItem = () => {
    setItems([...items, { id: Date.now(), product: "", quantity: 1, unitPrice: 0, reason: "" }])
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice * 1.1, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Return</h1>
          <p className="text-muted-foreground">Update return details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Return Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" value={formData.reference} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Return Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer Return</SelectItem>
                  <SelectItem value="supplier">Supplier Return</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select
                value={formData.customer}
                onValueChange={(value) => setFormData({ ...formData, customer: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Acme Corporation">Acme Corporation</SelectItem>
                  <SelectItem value="Tech Solutions Inc">Tech Solutions Inc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalSale">Original Sale</Label>
              <Input
                id="originalSale"
                value={formData.originalSale}
                onChange={(e) => setFormData({ ...formData, originalSale: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="refundMethod">Refund Method</Label>
              <Select
                value={formData.refundMethod}
                onValueChange={(value) => setFormData({ ...formData, refundMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Original Payment Method">Original Payment Method</SelectItem>
                  <SelectItem value="Store Credit">Store Credit</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="refundStatus">Refund Status</Label>
              <Select
                value={formData.refundStatus}
                onValueChange={(value) => setFormData({ ...formData, refundStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Returned Items</CardTitle>
          <Button onClick={addItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 items-end p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Label>Product</Label>
                <Input placeholder="Select product" value={item.product} />
              </div>
              <div className="w-24 space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={item.quantity} />
              </div>
              <div className="w-32 space-y-2">
                <Label>Unit Price</Label>
                <Input type="number" value={item.unitPrice} />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Reason</Label>
                <Select value={item.reason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Defective">Defective</SelectItem>
                    <SelectItem value="Wrong Item">Wrong Item</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                    <SelectItem value="Not as Described">Not as Described</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Refund:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={() => router.push("/returns")}>Save Changes</Button>
      </div>
    </div>
  )
}
