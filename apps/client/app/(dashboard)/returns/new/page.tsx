"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useAllProducts } from "@/hooks/use-products";
import { useSuppliersApi } from "@/hooks/use-suppliers-api";
import { useReturnsApi } from "@/hooks/use-returns-api";
import { useToast } from "@/hooks/use-toast";

type ItemRow = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
};

function useSuppliersList() {
  const { getSuppliers } = useSuppliersApi();
  const [suppliers, setSuppliers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = (await getSuppliers({ limit: 1000 })) as any;
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.suppliers)
          ? res.suppliers
          : [];
        if (mounted) {
          setSuppliers(list.map((s: any) => ({ id: s.id, name: s.name })));
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load suppliers");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getSuppliers]);

  return { suppliers, loading, error };
}

export default function NewReturnPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { warehouses, loading: whLoading } = useWarehouses();
  const { products, loading: prodLoading } = useAllProducts();
  const { suppliers, loading: suppLoading } = useSuppliersList();
  const { createSalesReturn, createPurchaseReturn } = useReturnsApi();

  const [tab, setTab] = useState<"customer" | "supplier">("customer");

  const [customerForm, setCustomerForm] = useState({
    warehouseId: "",
    reason: "",
    items: [
      { id: crypto.randomUUID(), productId: "", quantity: 1, unitPrice: 0 },
    ] as ItemRow[],
  });

  const [supplierForm, setSupplierForm] = useState({
    warehouseId: "",
    supplierId: "",
    reason: "",
    items: [
      { id: crypto.randomUUID(), productId: "", quantity: 1, unitPrice: 0 },
    ] as ItemRow[],
  });

  const productsById = useMemo(() => {
    const map = new Map<string, any>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  const customerTotal = useMemo(
    () =>
      customerForm.items.reduce(
        (sum, it) =>
          sum + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0),
        0
      ),
    [customerForm.items]
  );
  const supplierTotal = useMemo(
    () =>
      supplierForm.items.reduce(
        (sum, it) =>
          sum + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0),
        0
      ),
    [supplierForm.items]
  );

  const addItem = (kind: "customer" | "supplier") => {
    const row: ItemRow = {
      id: crypto.randomUUID(),
      productId: "",
      quantity: 1,
      unitPrice: 0,
    };
    if (kind === "customer")
      setCustomerForm((f) => ({ ...f, items: [...f.items, row] }));
    else setSupplierForm((f) => ({ ...f, items: [...f.items, row] }));
  };

  const removeItem = (kind: "customer" | "supplier", id: string) => {
    if (kind === "customer")
      setCustomerForm((f) => ({
        ...f,
        items: f.items.filter((i) => i.id !== id),
      }));
    else
      setSupplierForm((f) => ({
        ...f,
        items: f.items.filter((i) => i.id !== id),
      }));
  };

  const updateItem = (
    kind: "customer" | "supplier",
    id: string,
    patch: Partial<ItemRow>
  ) => {
    const up = (items: ItemRow[]) =>
      items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    if (kind === "customer")
      setCustomerForm((f) => ({ ...f, items: up(f.items) }));
    else setSupplierForm((f) => ({ ...f, items: up(f.items) }));
  };

  const onProductSelected = (
    kind: "customer" | "supplier",
    id: string,
    productId: string
  ) => {
    const p = productsById.get(productId);
    const defaultPrice =
      kind === "customer"
        ? Number(p?.salePrice ?? 0)
        : Number(p?.costPrice ?? 0);
    updateItem(kind, id, { productId, unitPrice: defaultPrice });
  };

  const submitting = false; // can be wired if needed

  const handleCreateCustomer = async () => {
    try {
      if (!customerForm.warehouseId) throw new Error("Select a warehouse");
      const items = customerForm.items
        .filter((it) => it.productId && it.quantity > 0)
        .map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice),
        }));
      if (!items.length) throw new Error("Add at least one item");
      await createSalesReturn({
        warehouseId: customerForm.warehouseId,
        reason: customerForm.reason || undefined,
        items,
      });
      toast({ title: "Customer return created" });
      router.push("/returns");
    } catch (e: any) {
      toast({
        title: "Failed to create",
        description: e?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleCreateSupplier = async () => {
    try {
      if (!supplierForm.warehouseId) throw new Error("Select a warehouse");
      if (!supplierForm.supplierId) throw new Error("Select a supplier");
      const items = supplierForm.items
        .filter((it) => it.productId && it.quantity > 0)
        .map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: Number(it.unitPrice),
        }));
      if (!items.length) throw new Error("Add at least one item");
      await createPurchaseReturn({
        warehouseId: supplierForm.warehouseId,
        supplierId: supplierForm.supplierId,
        reason: supplierForm.reason || undefined,
        items,
      });
      toast({ title: "Supplier return created" });
      router.push("/returns");
    } catch (e: any) {
      toast({
        title: "Failed to create",
        description: e?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  const disabled =
    whLoading || prodLoading || (tab === "supplier" && suppLoading);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/returns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">New Return</h1>
          <p className="text-sm text-muted-foreground">
            Create a customer or supplier return
          </p>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as any)}
        className="max-w-5xl"
      >
        <TabsList>
          <TabsTrigger value="customer" className="gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" /> Customer Return
          </TabsTrigger>
          <TabsTrigger value="supplier" className="gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Supplier Return
          </TabsTrigger>
        </TabsList>

        {/* Customer Return */}
        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle>Customer Return</CardTitle>
              <CardDescription>Add items back to inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Warehouse</Label>
                  <Select
                    value={customerForm.warehouseId}
                    onValueChange={(v) =>
                      setCustomerForm((f) => ({ ...f, warehouseId: v }))
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Reason</Label>
                  <Input
                    placeholder="Optional reason"
                    value={customerForm.reason}
                    onChange={(e) =>
                      setCustomerForm((f) => ({ ...f, reason: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Items</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => addItem("customer")}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add item
                  </Button>
                </div>

                {customerForm.items.map((it) => (
                  <div
                    key={it.id}
                    className="grid gap-3 md:grid-cols-12 items-end border rounded-md p-3"
                  >
                    <div className="md:col-span-6 flex flex-col gap-2">
                      <Label>Product</Label>
                      <Select
                        value={it.productId}
                        onValueChange={(v) =>
                          onProductSelected("customer", it.id, v)
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) =>
                          updateItem("customer", it.id, {
                            quantity: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={it.unitPrice}
                        onChange={(e) =>
                          updateItem("customer", it.id, {
                            unitPrice: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between gap-2">
                      <div className="text-sm text-muted-foreground">
                        {(
                          Number(it.unitPrice) * Number(it.quantity) || 0
                        ).toFixed(2)}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem("customer", it.id)}
                        disabled={customerForm.items.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end text-sm text-muted-foreground">
                  <div>Total: ${customerTotal.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/returns")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCustomer}
                  disabled={disabled || submitting}
                >
                  Create Return
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplier Return */}
        <TabsContent value="supplier">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Return</CardTitle>
              <CardDescription>Send items back to supplier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label>Warehouse</Label>
                  <Select
                    value={supplierForm.warehouseId}
                    onValueChange={(v) =>
                      setSupplierForm((f) => ({ ...f, warehouseId: v }))
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Supplier</Label>
                  <Select
                    value={supplierForm.supplierId}
                    onValueChange={(v) =>
                      setSupplierForm((f) => ({ ...f, supplierId: v }))
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Reason</Label>
                  <Input
                    placeholder="Optional reason"
                    value={supplierForm.reason}
                    onChange={(e) =>
                      setSupplierForm((f) => ({ ...f, reason: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Items</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => addItem("supplier")}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add item
                  </Button>
                </div>

                {supplierForm.items.map((it) => (
                  <div
                    key={it.id}
                    className="grid gap-3 md:grid-cols-12 items-end border rounded-md p-3"
                  >
                    <div className="md:col-span-6 flex flex-col gap-2">
                      <Label>Product</Label>
                      <Select
                        value={it.productId}
                        onValueChange={(v) =>
                          onProductSelected("supplier", it.id, v)
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) =>
                          updateItem("supplier", it.id, {
                            quantity: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={it.unitPrice}
                        onChange={(e) =>
                          updateItem("supplier", it.id, {
                            unitPrice: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between gap-2">
                      <div className="text-sm text-muted-foreground">
                        {(
                          Number(it.unitPrice) * Number(it.quantity) || 0
                        ).toFixed(2)}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem("supplier", it.id)}
                        disabled={supplierForm.items.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end text-sm text-muted-foreground">
                  <div>Total: ${supplierTotal.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/returns")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSupplier}
                  disabled={disabled || submitting}
                >
                  Create Return
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
