"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Download, FileText, Calendar } from "lucide-react";

export default function ExpenseReportsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const reports = [
    {
      id: "1",
      name: "Monthly Expense Summary - January 2024",
      period: "2024-01",
      type: "Monthly",
      totalAmount: 15240.50,
      status: "finalized",
      createdDate: "2024-02-01",
    },
    {
      id: "2",
      name: "Q1 2024 Expense Report",
      period: "2024-Q1",
      type: "Quarterly",
      totalAmount: 45890.00,
      status: "draft",
      createdDate: "2024-03-25",
    },
    {
      id: "3",
      name: "Travel Expenses - March 2024",
      period: "2024-03",
      type: "Category",
      totalAmount: 8500.00,
      status: "finalized",
      createdDate: "2024-04-01",
    },
    {
      id: "4",
      name: "Department Expense Analysis",
      period: "2024-03",
      type: "Custom",
      totalAmount: 22100.00,
      status: "pending",
      createdDate: "2024-03-28",
    },
  ];

  const filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalReports = reports.length;
  const finalizedReports = reports.filter(r => r.status === "finalized").length;
  const totalAmount = reports.reduce((sum, r) => sum + r.totalAmount, 0);

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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Reports</h1>
          <p className="text-muted-foreground">Generate and manage expense reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => router.push("/expenses/reports/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Finalized Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalizedReports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>View and manage expense reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow
                  key={report.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/expenses/reports/${report.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{report.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {report.period}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${report.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>{report.createdDate}</TableCell>
                  <TableCell>{renderStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/expenses/reports/${report.id}`);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
