"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { PurchaseOrder } from "@/hooks/use-purchases-api";

function formatCurrency(n: number | string | undefined) {
  const value = typeof n === "string" ? Number(n) : n ?? 0;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(s: string | Date | undefined) {
  if (!s) return "-";
  try {
    const d = typeof s === "string" ? new Date(s) : s;
    return d.toLocaleDateString();
  } catch {
    return String(s);
  }
}

function statusBadgeVariant(
  status: string
): React.ComponentProps<typeof Badge>["variant"] {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "RECEIVED":
      return "default";
    case "CANCELLED":
      return "outline";
    default:
      return "secondary";
  }
}

export interface PurchasesTableProps {
  purchases: PurchaseOrder[];
  canManage: boolean; // OWNER | ADMIN | MANAGER
  onReceive?: (id: string) => Promise<void> | void;
}

export function PurchasesTable({
  purchases,
  canManage,
  onReceive,
}: PurchasesTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference #</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Order Date</TableHead>
            {canManage ? (
              <TableHead className="text-right">Actions</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases?.length ? (
            purchases.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-mono text-xs">
                  {po.referenceNumber}
                </TableCell>
                <TableCell>{po.supplier?.name ?? "-"}</TableCell>
                <TableCell>{po.warehouse?.name ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(po.status)}>
                    {po.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(po.totalAmount)}
                </TableCell>
                <TableCell>{formatDate(po.orderDate)}</TableCell>
                {canManage ? (
                  <TableCell className="text-right">
                    {po.status === "PENDING" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={async () => {
                              if (onReceive) await onReceive(po.id);
                            }}
                          >
                            Mark as Received
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-sm text-muted-foreground py-10"
              >
                No purchase orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default PurchasesTable;
