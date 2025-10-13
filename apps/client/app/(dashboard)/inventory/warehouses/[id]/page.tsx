"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, MapPin, Package, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  const warehouse = {
    id: params.id as string,
    code: "WH-001",
    name: "Main Warehouse",
    type: "Central",
    status: "active",
    address: "123 Industrial Park, Business District",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA",
    phone: "+1 (555) 123-4567",
    email: "mainwarehouse@company.com",
    manager: "John Doe",
    capacity: 10000,
    currentOccupancy: 7500,
    totalProducts: 350,
    totalValue: 450000,
    inventory: [
      { id: "1", sku: "PROD-001", name: "Product A", quantity: 150, unit: "pcs", value: 7500 },
      { id: "2", sku: "PROD-002", name: "Product B", quantity: 200, unit: "pcs", value: 12000 },
      { id: "3", sku: "PROD-003", name: "Product C", quantity: 100, unit: "pcs", value: 15000 },
    ],
    recentActivity: [
      { date: "2024-01-20", type: "Inbound", description: "Purchase Order #PO-001", items: 50 },
      { date: "2024-01-19", type: "Outbound", description: "Sales Order #SO-123", items: 30 },
      { date: "2024-01-18", type: "Transfer", description: "Transfer to Branch A", items: 20 },
    ],
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 300);
  }, [params.id]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "maintenance":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const occupancyPercentage = (warehouse.currentOccupancy / warehouse.capacity) * 100;

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading warehouse...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{warehouse.name}</h1>
              <p className="text-muted-foreground">{warehouse.code} • {warehouse.type}</p>
            </div>
          </div>
          {renderStatusBadge(warehouse.status)}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/inventory/transfer/new?warehouse=${warehouse.id}`)}>
            New Transfer
          </Button>
          <Button variant="outline" onClick={() => router.push(`/inventory/warehouses/${warehouse.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <Separator />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{warehouse.capacity.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">sq ft</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{occupancyPercentage.toFixed(0)}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{warehouse.currentOccupancy.toLocaleString()} / {warehouse.capacity.toLocaleString()} sq ft</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">{warehouse.totalProducts}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">${warehouse.totalValue.toLocaleString()}</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Information Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Warehouse Code</p>
                  <p className="font-semibold">{warehouse.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold">{warehouse.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Manager</p>
                  <p className="font-semibold">{warehouse.manager}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {renderStatusBadge(warehouse.status)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-semibold">{warehouse.address}</p>
                <p className="font-semibold">
                  {warehouse.city}, {warehouse.state} {warehouse.zipCode}
                </p>
                <p className="font-semibold">{warehouse.country}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{warehouse.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{warehouse.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capacity Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Capacity</span>
                <span className="font-semibold">{warehouse.capacity.toLocaleString()} sq ft</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Occupancy</span>
                <span className="font-semibold">{warehouse.currentOccupancy.toLocaleString()} sq ft</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available Space</span>
                <span className="font-semibold">
                  {(warehouse.capacity - warehouse.currentOccupancy).toLocaleString()} sq ft
                </span>
              </div>
              <Separator />
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Occupancy Rate</span>
                  <span className="text-sm font-bold">{occupancyPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      occupancyPercentage > 90
                        ? "bg-red-500"
                        : occupancyPercentage > 75
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouse.inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.sku}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right font-semibold">{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${item.value.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouse.recentActivity.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>{activity.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            activity.type === "Inbound"
                              ? "bg-green-50 text-green-700 border-green-300"
                              : activity.type === "Outbound"
                              ? "bg-blue-50 text-blue-700 border-blue-300"
                              : "bg-purple-50 text-purple-700 border-purple-300"
                          }
                        >
                          {activity.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{activity.description}</TableCell>
                      <TableCell className="text-right font-semibold">{activity.items}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
