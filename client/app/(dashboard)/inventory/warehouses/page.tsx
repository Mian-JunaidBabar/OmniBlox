"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Warehouse, MapPin, Package, Plus, Search, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function WarehousesPage() {
  const router = useRouter()
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Warehouse Management</h1>
        <p className="text-sm text-muted-foreground">Manage your warehouse locations</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div></div>
        <Link href="/inventory/warehouses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Active locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50,000</div>
            <p className="text-xs text-muted-foreground">Units capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Utilization</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">34,000 / 50,000 units</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Warehouses</CardTitle>
              <CardDescription>Manage your warehouse locations and inventory</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search warehouses..." className="pl-8 w-[300px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push("/inventory/warehouses/1")}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Main Warehouse</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    New York, NY
                  </div>
                </TableCell>
                <TableCell>15,000 units</TableCell>
                <TableCell>12,450 units</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2 max-w-[100px]">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "83%" }} />
                    </div>
                    <span className="text-sm">83%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-success/10 text-success">
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push("/inventory/warehouses/2")}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Warehouse 2</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    Los Angeles, CA
                  </div>
                </TableCell>
                <TableCell>12,000 units</TableCell>
                <TableCell>8,200 units</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2 max-w-[100px]">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "68%" }} />
                    </div>
                    <span className="text-sm">68%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-success/10 text-success">
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push("/inventory/warehouses/3")}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Warehouse 3</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    Chicago, IL
                  </div>
                </TableCell>
                <TableCell>10,000 units</TableCell>
                <TableCell>6,800 units</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2 max-w-[100px]">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "68%" }} />
                    </div>
                    <span className="text-sm">68%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-success/10 text-success">
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
