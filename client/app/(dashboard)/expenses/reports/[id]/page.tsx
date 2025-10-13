"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Download, FileText, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ExpenseReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  const report = {
    id: params.id as string,
    name: "Monthly Expense Summary - January 2024",
    period: "2024-01",
    type: "Monthly",
    status: "finalized",
    createdDate: "2024-02-01",
    createdBy: "John Doe",
    totalAmount: 15240.50,
    categories: [
      { name: "Office Supplies", amount: 2500, percentage: 16 },
      { name: "Utilities", amount: 3200, percentage: 21 },
      { name: "Travel", amount: 5000, percentage: 33 },
      { name: "Marketing", amount: 4540.50, percentage: 30 },
    ],
    expenses: [
      { id: "1", date: "2024-01-20", category: "Office Supplies", description: "Printer Paper", amount: 150, vendor: "Staples" },
      { id: "2", date: "2024-01-18", category: "Travel", description: "Flight Tickets", amount: 2500, vendor: "Airlines Inc" },
      { id: "3", date: "2024-01-15", category: "Utilities", description: "Electric Bill", amount: 1200, vendor: "Power Company" },
    ],
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 300);
  }, [params.id]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "finalized":
        return <Badge variant="default" className="bg-green-500">Finalized</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading report...</p>
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
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{report.name}</h1>
              <p className="text-muted-foreground">{report.type} Report • {report.period}</p>
            </div>
          </div>
          {renderStatusBadge(report.status)}
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => router.push(`/expenses/reports/${report.id}/edit`)}>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">${report.totalAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-lg font-semibold">{report.period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="text-lg font-semibold">{report.createdDate}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created By</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{report.createdBy}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.categories.map((category, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${category.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{category.percentage}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Expense Details */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>{expense.vendor}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${expense.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Expenses</span>
            <span className="text-2xl font-bold">${report.totalAmount.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Report Status</span>
            {renderStatusBadge(report.status)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
