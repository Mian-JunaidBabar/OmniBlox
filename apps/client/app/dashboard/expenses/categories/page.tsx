"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, FolderOpen } from "lucide-react";

export default function ExpenseCategoriesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "1", name: "Office Supplies", code: "OFF-SUP", totalExpenses: 12500, monthlyBudget: 5000, status: "active", color: "#3b82f6" },
    { id: "2", name: "Utilities", code: "UTL", totalExpenses: 8200, monthlyBudget: 3000, status: "active", color: "#10b981" },
    { id: "3", name: "Travel", code: "TRV", totalExpenses: 25000, monthlyBudget: 10000, status: "active", color: "#f59e0b" },
    { id: "4", name: "Marketing", code: "MKT", totalExpenses: 45000, monthlyBudget: 15000, status: "active", color: "#ef4444" },
    { id: "5", name: "Software & Tools", code: "SFT", totalExpenses: 18000, monthlyBudget: 8000, status: "active", color: "#8b5cf6" },
  ];

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCategories = categories.length;
  const totalBudget = categories.reduce((sum, c) => sum + c.monthlyBudget, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.totalExpenses, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Categories</h1>
          <p className="text-muted-foreground">Manage and organize expense categories</p>
        </div>
        <Button onClick={() => router.push("/expenses/categories/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>Manage your expense categories and budgets</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">Monthly Budget</TableHead>
                <TableHead className="text-right">Total Expenses</TableHead>
                <TableHead className="text-right">Budget Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => {
                const budgetUsage = ((category.totalExpenses / category.monthlyBudget) * 100).toFixed(0);
                return (
                  <TableRow
                    key={category.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/expenses/categories/${category.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{category.code}</TableCell>
                    <TableCell className="text-right">${category.monthlyBudget.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">${category.totalExpenses.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={parseInt(budgetUsage) > 100 ? "destructive" : "outline"}>
                        {budgetUsage}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        {category.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/expenses/categories/${category.id}`);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
