"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, DollarSign, Building, CreditCard, TrendingUp, Calendar, Star, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  const customer = {
    id: params.id as string,
    name: "Acme Corp",
    email: "contact@acme.com",
    phone: "+1 234 567 8900",
    address: "123 Business Street",
    city: "New York",
    country: "United States",
    taxId: "TAX-123456",
    status: "active",
    balance: 5000,
    totalPurchases: 45000,
    lastPurchase: "2024-01-15",
    creditLimit: 50000,
    paymentTerms: "Net 30",
    rating: 5,
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 300);
  }, [params.id]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "blocked":
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading customer details...</p>
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
          <div>
            <h1 className="text-3xl font-bold">{customer.name}</h1>
            <p className="text-muted-foreground">{customer.email}</p>
          </div>
          {renderStatusBadge(customer.status)}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/people/customers/${customer.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Separator />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">${customer.totalPurchases?.toLocaleString() || "0"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold">${customer.balance?.toLocaleString() || "0"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credit Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">${customer.creditLimit?.toLocaleString() || "0"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {renderRating(customer.rating || 0)}
              <span className="text-sm text-muted-foreground">({customer.rating || 0}/5)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company Name</p>
                    <p className="font-medium">{customer.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tax ID</p>
                    <p className="font-medium">{customer.taxId || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Purchase</p>
                    <p className="font-medium">{customer.lastPurchase || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium">{customer.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.city}, {customer.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Terms</p>
                  <p className="font-medium">{customer.paymentTerms || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credit Limit</p>
                  <p className="font-medium">${customer.creditLimit?.toLocaleString() || "0"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p className="font-medium">${customer.balance?.toLocaleString() || "0"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                  <p className="font-medium">${customer.totalPurchases?.toLocaleString() || "0"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Rating</p>
                  <div className="flex items-center gap-2 mt-1">
                    {renderRating(customer.rating || 0)}
                    <span className="text-sm font-medium">({customer.rating || 0}/5)</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {renderStatusBadge(customer.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Order history coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Invoice history coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Document management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
