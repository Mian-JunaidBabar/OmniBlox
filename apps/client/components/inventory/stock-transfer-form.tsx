"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, CheckCircle2, Package, MapPin } from "lucide-react";
import { useProductApi } from "@/hooks/use-product-api";
import type { Product } from "@/lib/types";

interface TransferItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  availableStock: number;
}

type TransferStep = "details" | "items" | "review";

export function StockTransferForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<TransferStep>("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [notes, setNotes] = useState("");
  const { getProducts } = useProductApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoadingProducts(true);
        setLoadError(null);
        const { products: list } = await getProducts({ page: 1, limit: 100 });
        if (!cancelled) setProducts(list || []);
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message || "Failed to load products");
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [getProducts]);

  const addTransferItem = () => {
    if (!selectedProduct) return;

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const newItem: TransferItem = {
      id: Math.random().toString(),
      productId: product.id,
      productName: product.name,
      quantity,
      availableStock: product.stock,
    };

    setTransferItems([...transferItems, newItem]);
    setSelectedProduct("");
    setQuantity(1);
  };

  const removeTransferItem = (id: string) => {
    setTransferItems(transferItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    setTransferItems(
      transferItems.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const canProceedToItems =
    fromLocation && toLocation && fromLocation !== toLocation;
  const hasStockIssues = transferItems.some(
    (item) => item.quantity > item.availableStock
  );
  const canProceedToReview = transferItems.length > 0 && !hasStockIssues;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/inventory");
  };

  const steps = [
    { id: "details", label: "Transfer Details", icon: MapPin },
    { id: "items", label: "Select Items", icon: Package },
    { id: "review", label: "Review & Submit", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted =
                (step.id === "details" &&
                  (currentStep === "items" || currentStep === "review")) ||
                (step.id === "items" && currentStep === "review");

              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div
                        className={`text-sm font-medium ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        Step {index + 1}
                      </div>
                      <div
                        className={`text-xs ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-px flex-1 ${
                        isCompleted ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === "details" && (
        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
            <CardDescription>
              Specify source and destination locations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transferNumber">Transfer Number</Label>
                <Input id="transferNumber" placeholder="TRF-" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Transfer Date</Label>
                <Input id="date" type="date" required />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from">From Location</Label>
                <Select value={fromLocation} onValueChange={setFromLocation}>
                  <SelectTrigger id="from">
                    <SelectValue placeholder="Select source location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse-a">Warehouse A</SelectItem>
                    <SelectItem value="warehouse-b">Warehouse B</SelectItem>
                    <SelectItem value="warehouse-c">Warehouse C</SelectItem>
                    <SelectItem value="retail-store">Retail Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To Location</Label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger id="to">
                    <SelectValue placeholder="Select destination location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse-a">Warehouse A</SelectItem>
                    <SelectItem value="warehouse-b">Warehouse B</SelectItem>
                    <SelectItem value="warehouse-c">Warehouse C</SelectItem>
                    <SelectItem value="retail-store">Retail Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this transfer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep("items")}
                disabled={!canProceedToItems}
              >
                Next: Select Items
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "items" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Items</CardTitle>
            <CardDescription>Add products to transfer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProducts && (
                      <SelectItem value="" disabled>
                        Loading products...
                      </SelectItem>
                    )}
                    {!loadingProducts && loadError && (
                      <SelectItem value="" disabled>
                        {loadError}
                      </SelectItem>
                    )}
                    {!loadingProducts &&
                      !loadError &&
                      products.length === 0 && (
                        <SelectItem value="" disabled>
                          No products available
                        </SelectItem>
                      )}
                    {!loadingProducts &&
                      !loadError &&
                      products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stock})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Number.parseInt(e.target.value) || 1)
                }
                className="w-24"
                placeholder="Qty"
              />
              <Button
                type="button"
                onClick={addTransferItem}
                disabled={!selectedProduct}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {transferItems.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="w-32">Quantity</TableHead>
                      <TableHead>Available Stock</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transferItems.map((item) => {
                      const exceedsStock = item.quantity > item.availableStock;
                      return (
                        <TableRow
                          key={item.id}
                          className={exceedsStock ? "bg-destructive/10" : ""}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {item.productName}
                              </div>
                              {exceedsStock && (
                                <div className="text-xs text-destructive">
                                  Only {item.availableStock} available in stock
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.id,
                                  Number.parseInt(e.target.value) || 1
                                )
                              }
                              className={
                                exceedsStock ? "border-destructive" : ""
                              }
                            />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.availableStock}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTransferItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">
                  No items added yet
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("details")}
              >
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep("review")}
                disabled={!canProceedToReview}
              >
                Next: Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "review" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Summary</CardTitle>
                <CardDescription>
                  Review transfer details before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      From Location
                    </div>
                    <div className="mt-1 capitalize">
                      {fromLocation.replace("-", " ")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      To Location
                    </div>
                    <div className="mt-1 capitalize">
                      {toLocation.replace("-", " ")}
                    </div>
                  </div>
                </div>

                {notes && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Notes
                    </div>
                    <div className="mt-1 text-sm">{notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transfer Items</CardTitle>
                <CardDescription>
                  {transferItems.length} item(s) to transfer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.productName}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantity}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Initial transfer status</CardDescription>
              </CardHeader>
              <CardContent>
                <Select defaultValue="draft">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-transit">In Transit</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Transfer"}
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep("items")}>
                Back
              </Button>
              <Button variant="ghost" onClick={() => router.push("/inventory")}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
