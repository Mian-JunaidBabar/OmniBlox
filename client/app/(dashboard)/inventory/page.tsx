"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Warehouse, TrendingUp, AlertTriangle, Search } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function InventoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Inventory Management</h1>
        <p className="text-sm text-muted-foreground">Manage stock across all warehouses</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex gap-2">
          <Link href="/inventory/transfer">
            <Button>
              <Package className="mr-2 h-4 w-4" />
              Stock Transfer
            </Button>
          </Link>
          <Link href="/inventory/warehouses">
            <Button variant="outline">
              <Warehouse className="mr-2 h-4 w-4" />
              Manage Warehouses
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,430</div>
            <p className="text-xs text-muted-foreground">Across all warehouses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Unique products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">23</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Active locations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock" className="w-full">
        <TabsList>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="transfers">Recent Transfers</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Stock Levels by Warehouse</CardTitle>
                  <CardDescription>Current inventory across all locations</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search products..." className="pl-8 w-[300px]" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Main Warehouse</TableHead>
                    <TableHead>Warehouse 2</TableHead>
                    <TableHead>Warehouse 3</TableHead>
                    <TableHead>Total Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Laptop Pro 15"</TableCell>
                    <TableCell>LAP-001</TableCell>
                    <TableCell>45</TableCell>
                    <TableCell>32</TableCell>
                    <TableCell>18</TableCell>
                    <TableCell className="font-semibold">95</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-success/10 text-success">
                        In Stock
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Wireless Mouse</TableCell>
                    <TableCell>MOU-002</TableCell>
                    <TableCell>8</TableCell>
                    <TableCell>5</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell className="font-semibold">15</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-warning/10 text-warning">
                        Low Stock
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">USB-C Cable</TableCell>
                    <TableCell>CAB-003</TableCell>
                    <TableCell>120</TableCell>
                    <TableCell>85</TableCell>
                    <TableCell>65</TableCell>
                    <TableCell className="font-semibold">270</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-success/10 text-success">
                        In Stock
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Transfers</CardTitle>
              <CardDescription>Latest inventory movements between warehouses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">TRF-001</TableCell>
                    <TableCell>Main Warehouse</TableCell>
                    <TableCell>Warehouse 2</TableCell>
                    <TableCell>15 items</TableCell>
                    <TableCell>2024-01-15</TableCell>
                    <TableCell>
                      <Badge>Completed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">TRF-002</TableCell>
                    <TableCell>Warehouse 3</TableCell>
                    <TableCell>Main Warehouse</TableCell>
                    <TableCell>8 items</TableCell>
                    <TableCell>2024-01-14</TableCell>
                    <TableCell>
                      <Badge variant="outline">In Transit</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Low Stock Alert</h4>
                    <p className="text-sm text-muted-foreground">
                      Wireless Mouse (MOU-002) is running low across all warehouses. Current stock: 15 units
                    </p>
                  </div>
                  <Button size="sm">Reorder</Button>
                </div>
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Out of Stock</h4>
                    <p className="text-sm text-muted-foreground">
                      Mechanical Keyboard (KEY-005) is out of stock in Main Warehouse
                    </p>
                  </div>
                  <Button size="sm">Transfer Stock</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
