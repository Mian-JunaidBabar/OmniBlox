"use client";

import { useAuthenticatedApi } from "./use-authenticated-api";

export type OrderStatus = "PENDING" | "RECEIVED" | "CANCELLED" | string;

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitCost: number;
  product?: {
    id: string;
    name: string;
    sku?: string;
  };
}

export interface PurchaseOrder {
  id: string;
  referenceNumber: string;
  orderDate: string;
  status: OrderStatus;
  subtotal?: number;
  totalAmount: number;
  supplier: { id: string; name: string };
  warehouse?: { id: string; name: string } | null;
  items?: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  warehouseId: string;
  orderDate: string; // ISO string
  referenceNumber?: string;
  status?: OrderStatus;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
  }>;
}

export function usePurchasesApi() {
  const { get, post, patch } = useAuthenticatedApi();

  return {
    list: async (): Promise<PurchaseOrder[]> => {
      const res = (await get("/purchases")) as PurchaseOrder[];
      return Array.isArray(res) ? res : [];
    },
    create: async (data: CreatePurchaseOrderDto): Promise<PurchaseOrder> => {
      return (await post("/purchases", data)) as PurchaseOrder;
    },
    receive: async (id: string): Promise<PurchaseOrder> => {
      return (await patch(`/purchases/${id}/receive`)) as PurchaseOrder;
    },
  };
}
