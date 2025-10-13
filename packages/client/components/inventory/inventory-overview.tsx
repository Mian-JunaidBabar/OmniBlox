"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockProducts, mockStockTransfers } from "@/lib/mock-data"
import { AlertCircle, Package, TrendingDown, TrendingUp } from "lucide-react"
import Link from "next/link"

export function InventoryOverview() {
  const totalStock = mockProducts.reduce((sum, p) => sum + p.stock, 0)
  const lowStockItems = mockProducts.filter((p) => p.stock <= p.reorderLevel)
  const totalValue = mockProducts.reduce((sum, p) => sum + p.stock * p.cost, 0)

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    completed: "default",
    "in-transit": "secondary",
    pending: "outline",
    draft: "outline",
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Units</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">At cost price</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="transfers">Recent Transfers</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Levels by Product</CardTitle>
              <CardDescription>Current inventory status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right">Reorder Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stock Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProducts.map((product) => {
                      const isLow = product.stock <= product.reorderLevel
                      const stockPercentage = (product.stock / (product.reorderLevel * 3)) * 100

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Link href={`/products/${product.id}`} className="font-medium hover:underline">
                              {product.name}
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                          <TableCell className="text-right font-medium">{product.stock}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{product.reorderLevel}</TableCell>
                          <TableCell>
                            {isLow ? (
                              <Badge variant="destructive" className="gap-1">
                                <TrendingDown className="h-3 w-3" />
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="default" className="gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Healthy
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={Math.min(stockPercentage, 100)} className="h-2 w-24" />
                              <span className="text-xs text-muted-foreground">{Math.round(stockPercentage)}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Transfers</CardTitle>
              <CardDescription>Latest inventory movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer #</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStockTransfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell>
                          <Link
                            href={`/inventory/transfer/${transfer.id}`}
                            className="font-mono text-sm font-medium hover:underline"
                          >
                            {transfer.transferNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">{transfer.fromLocation}</TableCell>
                        <TableCell className="text-sm">{transfer.toLocation}</TableCell>
                        <TableCell className="text-sm">{new Date(transfer.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{transfer.items.length} item(s)</TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[transfer.status]} className="capitalize">
                            {transfer.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
