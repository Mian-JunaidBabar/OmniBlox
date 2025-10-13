"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

interface ReturnItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export default function NewReturnPage() {
  const router = useRouter()
  const [returnType, setReturnType] = useState<"customer" | "supplier">("customer")
  const [items, setItems] = useState<ReturnItem[]>([
    { id: "1", productId: "", productName: "", quantity: 1, unitPrice: 0, total: 0 },
  ])

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        productId: "",
        productName: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof ReturnItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      }),
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    router.push("/returns")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/returns">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Return</h1>
          <p className="text-muted-foreground">Create a new return transaction</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Return Information</CardTitle>
            <CardDescription>Enter the basic return details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="returnType">Return Type</Label>
                <Select value={returnType} onValueChange={(value: any) => setReturnType(value)}>
                  <SelectTrigger id="returnType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer Return</SelectItem>
                    <SelectItem value="supplier">Supplier Return</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input id="reference" placeholder="RET-001" required />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="entity">{returnType === "customer" ? "Customer" : "Supplier"}</Label>
                <Select>
                  <SelectTrigger id="entity">
                    <SelectValue placeholder={`Select ${returnType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Entity 1</SelectItem>
                    <SelectItem value="2">Entity 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Return Date</Label>
                <Input id="date" type="date" required />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="reason">Reason for Return</Label>
              <Textarea id="reason" placeholder="Enter reason for return" rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Return Items</CardTitle>
                <CardDescription>Add items to this return</CardDescription>
              </div>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-end border-b pb-4 last:border-0">
                  <div className="flex-1 grid gap-4 md:grid-cols-5">
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <Label>Product</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(value) => {
                          updateItem(item.id, "productId", value)
                          updateItem(item.id, "productName", "Product " + value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Product 1</SelectItem>
                          <SelectItem value="2">Product 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Total</Label>
                      <Input type="text" value={`$${item.total.toFixed(2)}`} disabled />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="flex justify-end pt-4 border-t">
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/returns">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">Create Return</Button>
        </div>
      </form>
    </div>
  )
}
