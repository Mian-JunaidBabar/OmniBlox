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
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

interface TransferItem {
  id: string
  productId: string
  productName: string
  quantity: number
  availableStock: number
}

export default function StockTransferPage() {
  const router = useRouter()
  const [items, setItems] = useState<TransferItem[]>([
    { id: "1", productId: "", productName: "", quantity: 1, availableStock: 0 },
  ])

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        productId: "",
        productName: "",
        quantity: 1,
        availableStock: 0,
      },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof TransferItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value }
        }
        return item
      }),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/inventory")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Stock Transfer</h1>
            <p className="text-sm text-muted-foreground">Transfer inventory between warehouses</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Information</CardTitle>
            <CardDescription>Select source and destination warehouses</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="fromWarehouse">From Warehouse</Label>
                <Select>
                  <SelectTrigger id="fromWarehouse">
                    <SelectValue placeholder="Select source warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Main Warehouse</SelectItem>
                    <SelectItem value="2">Warehouse 2</SelectItem>
                    <SelectItem value="3">Warehouse 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="toWarehouse">To Warehouse</Label>
                <Select>
                  <SelectTrigger id="toWarehouse">
                    <SelectValue placeholder="Select destination warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Main Warehouse</SelectItem>
                    <SelectItem value="2">Warehouse 2</SelectItem>
                    <SelectItem value="3">Warehouse 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input id="reference" placeholder="TRF-001" required />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Transfer Date</Label>
                <Input id="date" type="date" required />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes about this transfer" rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transfer Items</CardTitle>
                <CardDescription>Add items to transfer</CardDescription>
              </div>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-end border-b pb-4 last:border-0">
                  <div className="flex-1 grid gap-4 md:grid-cols-3">
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <Label>Product</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(value) => {
                          updateItem(item.id, "productId", value)
                          updateItem(item.id, "productName", "Product " + value)
                          updateItem(item.id, "availableStock", 100)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Laptop Pro 15"</SelectItem>
                          <SelectItem value="2">Wireless Mouse</SelectItem>
                          <SelectItem value="3">USB-C Cable</SelectItem>
                        </SelectContent>
                      </Select>
                      {item.availableStock > 0 && (
                        <p className="text-xs text-muted-foreground">Available: {item.availableStock} units</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Quantity to Transfer</Label>
                      <Input
                        type="number"
                        min="1"
                        max={item.availableStock}
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                      />
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
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/inventory">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">
            Create Transfer
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
