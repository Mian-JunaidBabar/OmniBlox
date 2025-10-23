"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAllProducts } from "@/hooks/use-products";

type AdjustmentItem = {
  id: string;
  productId: string;
  currentStock: number;
  newStock: number;
  difference: number;
};

export default function StockAdjustmentPage() {
  const router = useRouter();
  const [items, setItems] = useState<AdjustmentItem[]>([]);
  const [notes, setNotes] = useState("");
  const {
    products,
    loading: productsLoading,
    refreshing: productsRefreshing,
    error: productsError,
    reload: reloadProducts,
  } = useAllProducts();

  const addItem = () => {
    if (productsLoading || products.length === 0) {
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        productId: "",
        currentStock: 0,
        newStock: 0,
        difference: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (
    id: string,
    field: keyof AdjustmentItem,
    value: unknown
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const updated: AdjustmentItem = { ...item };

        if (field === "productId") {
          const nextProductId = value as string;
          updated.productId = nextProductId;
          const product = products.find((p) => p.id === nextProductId);
          updated.currentStock = product?.stock ?? 0;
        } else if (field === "newStock") {
          const parsed = Number(value);
          updated.newStock = Number.isFinite(parsed) ? parsed : 0;
        }

        updated.difference = updated.newStock - updated.currentStock;
        return updated;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Saving adjustment:", { items, notes });
    router.push("/products");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Stock Adjustment
          </h1>
          <p className="text-sm text-muted-foreground">
            Adjust inventory levels for products
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Adjustment Items</CardTitle>
                  <CardDescription>
                    Select products and set new stock levels
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={addItem}
                  size="sm"
                  className="gap-2"
                  disabled={products.length === 0}
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productsError && (
                  <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    {productsError}
                    <Button
                      variant="link"
                      type="button"
                      onClick={() => reloadProducts()}
                      className="ml-2 h-auto p-0"
                    >
                      Retry
                    </Button>
                  </div>
                )}
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {products.length === 0
                      ? productsLoading
                        ? "Loading products..."
                        : "No products available. Add products before creating adjustments."
                      : 'No items added yet. Click "Add Item" to start.'}
                  </p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 grid gap-4 md:grid-cols-4">
                          <div className="space-y-2">
                            <Label>Product</Label>
                            <Select
                              value={item.productId}
                              onValueChange={(value) =>
                                updateItem(item.id, "productId", value)
                              }
                              disabled={products.length === 0}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    products.length === 0
                                      ? productsLoading
                                        ? "Loading..."
                                        : "No products available"
                                      : productsRefreshing
                                      ? "Refreshing products..."
                                      : "Select product"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {products.length === 0 && productsLoading ? (
                                  <SelectItem value="__loading" disabled>
                                    <span className="flex items-center gap-2">
                                      <Loader2 className="h-3 w-3 animate-spin" />{" "}
                                      Loading products...
                                    </span>
                                  </SelectItem>
                                ) : products.length > 0 ? (
                                  products.map((product) => (
                                    <SelectItem
                                      key={product.id}
                                      value={product.id}
                                    >
                                      {product.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="__empty" disabled>
                                    No products available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Current Stock</Label>
                            <Input value={item.currentStock} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label>New Stock</Label>
                            <Input
                              type="number"
                              value={item.newStock}
                              onChange={(e) =>
                                updateItem(item.id, "newStock", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Difference</Label>
                            <Input
                              value={item.difference}
                              disabled
                              className={
                                item.difference > 0
                                  ? "text-success"
                                  : item.difference < 0
                                  ? "text-destructive"
                                  : ""
                              }
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adjustment Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter reason for adjustment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Total Items</p>
                  <p className="text-2xl font-semibold">{items.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Net Change</p>
                  <p className="text-2xl font-semibold">
                    {items.reduce((sum, item) => sum + item.difference, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={items.length === 0 || products.length === 0}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Adjustment
              </Button>
              <Link href="/products">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
