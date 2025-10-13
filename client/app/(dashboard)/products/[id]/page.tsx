"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Package, DollarSign, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { mockProducts, mockStockLedger } from "@/lib/mock-data"
import { use } from "react"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const product = mockProducts.find((p) => p.id === id)
  const ledger = mockStockLedger[id] || []

  if (!product) {
    return <div className="p-6">Product not found</div>
  }

  const profitMargin = ((product.price - product.cost) / product.price) * 100
  const totalValue = product.price * product.stock

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>
        <Link href={`/products/${id}/edit`}>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Product
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{product.stock}</div>
            <p className="text-xs text-muted-foreground">Reorder at {product.reorderLevel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selling Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">${product.price.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Cost: ${product.cost.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">${(product.price - product.cost).toFixed(2)} per unit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">At retail price</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Stock Ledger</CardTitle>
            <CardDescription>Transaction history for this product</CardDescription>
          </CardHeader>
          <CardContent>
            {ledger.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.type}</Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${entry.quantity > 0 ? "text-success" : "text-destructive"}`}
                      >
                        {entry.quantity > 0 ? "+" : ""}
                        {entry.quantity}
                      </TableCell>
                      <TableCell className="text-right">{entry.balance}</TableCell>
                      <TableCell className="font-mono text-xs">{entry.reference}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Category</p>
                <Badge variant="outline" className="mt-1">
                  {product.category}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={product.status === "active" ? "default" : "secondary"} className="mt-1">
                  {product.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground mt-1">{new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground mt-1">{new Date(product.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {product.stock <= product.reorderLevel && (
            <Card className="border-warning">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <CardTitle className="text-warning">Low Stock Alert</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Stock level is at or below the reorder point. Consider restocking soon.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
