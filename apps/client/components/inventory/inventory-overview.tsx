"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Package, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useProductApi } from "@/hooks/use-product-api";
import type { Product } from "@/lib/types";

export function InventoryOverview() {
  const { getProducts, getLowStockProducts } = useProductApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        // Fetch first page with a reasonably large limit to cover typical dashboards
        const [{ products: list }, low] = await Promise.all([
          getProducts({ page: 1, limit: 100 }),
          getLowStockProducts(),
        ]);
        if (!cancelled) {
          setProducts(list || []);
          setLowStockItems(low || []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load inventory data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [getProducts, getLowStockProducts]);

  const totalStock = useMemo(
    () => products.reduce((sum, p) => sum + (p.stock || 0), 0),
    [products]
  );
  // Total value at cost price per original UI label
  const totalValue = useMemo(
    () =>
      products.reduce((sum, p) => sum + (p.stock || 0) * (p.costPrice || 0), 0),
    [products]
  );

  const statusVariants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    completed: "default",
    "in-transit": "secondary",
    pending: "outline",
    draft: "outline",
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stock Units
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {loading ? "—" : totalStock.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {loading ? "—" : lowStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stock Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {loading
                ? "—"
                : `$${totalValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}`}
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
                      <TableHead className="text-right">
                        Current Stock
                      </TableHead>
                      <TableHead className="text-right">
                        Reorder Level
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stock Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-sm text-muted-foreground"
                        >
                          Loading products...
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && error && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-sm text-destructive"
                        >
                          {error}
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && !error && products.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-sm text-muted-foreground"
                        >
                          No products found.
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading &&
                      !error &&
                      products.map((product) => {
                        const current = product.stock || 0;
                        const reorder = product.reorderLevel || 0;
                        const isLow = current <= reorder && reorder > 0;
                        const denom = Math.max(reorder * 3, 1);
                        const stockPercentage = (current / denom) * 100;

                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Link
                                href={`/products/${product.id}`}
                                className="font-medium hover:underline"
                              >
                                {product.name}
                              </Link>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {product.sku}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {current}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {reorder}
                            </TableCell>
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
                                <Progress
                                  value={Math.min(stockPercentage, 100)}
                                  className="h-2 w-24"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(stockPercentage)}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
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
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-sm text-muted-foreground"
                      >
                        No transfers to show yet.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
