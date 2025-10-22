"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  FileText,
  Warehouse,
  BarChart3,
  Settings,
  ChevronDown,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Bell,
  FileQuestion,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: Package,
    children: [
      { name: "All Products", href: "/dashboard/products" },
      { name: "New Product", href: "/dashboard/products/new" },
      { name: "Barcode Labels", href: "/dashboard/products/barcodes" },
      { name: "Stock Adjustment", href: "/dashboard/products/adjustment" },
    ],
  },
  {
    name: "Sales",
    href: "/dashboard/sales",
    icon: FileText,
    children: [
      { name: "All Sales", href: "/dashboard/sales" },
      { name: "New Sale", href: "/dashboard/sales/new" },
      { name: "Deliveries", href: "/dashboard/sales/deliveries" },
    ],
  },
  {
    name: "Purchases",
    href: "/dashboard/purchases",
    icon: ShoppingCart,
    children: [
      { name: "All Purchases", href: "/dashboard/purchases" },
      { name: "New Purchase", href: "/dashboard/purchases/new" },
      { name: "Expenses", href: "/dashboard/purchases/expenses" },
    ],
  },
  {
    name: "Quotations",
    href: "/dashboard/quotations",
    icon: FileQuestion,
  },
  {
    name: "Returns",
    href: "/dashboard/returns",
    icon: RotateCcw,
  },
  {
    name: "Suppliers",
    href: "/dashboard/suppliers",
    icon: Building,
    children: [
      { name: "All Suppliers", href: "/dashboard/suppliers" },
      { name: "Add Supplier", href: "/dashboard/suppliers/new" },
      { name: "Purchase Orders", href: "/dashboard/suppliers/orders" },
      { name: "Payments", href: "/dashboard/suppliers/payments" },
    ],
  },
  {
    name: "People",
    href: "/dashboard/people",
    icon: Users,
    children: [
      { name: "Users", href: "/dashboard/people/users" },
      { name: "Billers", href: "/dashboard/people/billers" },
      { name: "Customers", href: "/dashboard/people/customers" },
      { name: "Suppliers", href: "/dashboard/people/suppliers" },
    ],
  },
  {
    name: "Inventory",
    href: "/dashboard/inventory",
    icon: Warehouse,
    children: [
      { name: "Stock Overview", href: "/dashboard/inventory" },
      { name: "Stock Transfer", href: "/dashboard/inventory/transfer" },
      { name: "Warehouses", href: "/dashboard/inventory/warehouses" },
    ],
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

type AppSidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

export function AppSidebar({ collapsed, onCollapsedChange }: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openSections, setOpenSections] = useState<string[]>([
    "Products",
    "Sales",
  ]);

  const toggleSection = (name: string) => {
    setOpenSections((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-[width] duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Top Logo & Toggle */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Package className="h-4 w-4" />
            </div>
            <span className="text-sm">OmniBlox 2.0</span>
          </Link>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-auto"
          onClick={() => onCollapsedChange(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          const Icon = item.icon;
          const isOpen = openSections.includes(item.name);

          if (item.children && !collapsed) {
            return (
              <div key={item.name}>
                <Button
                  variant="ghost"
                  onClick={() => toggleSection(item.name)}
                  className={cn(
                    "w-full justify-between text-sm font-normal",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </Button>

                {/* Smooth Dropdown Animation */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 pl-7 pt-1">
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link key={child.href} href={child.href}>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start text-sm font-normal",
                                  isChildActive &&
                                    "bg-accent text-accent-foreground"
                                )}
                              >
                                {child.name}
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-full text-sm font-normal",
                  collapsed ? "justify-center px-2" : "justify-start gap-3",
                  isActive && "bg-accent text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span>{item.name}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Info */}
      <div className="border-t border-border p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-medium">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "AD"}
            </div>
            <div className="flex-1 text-sm">
              <div className="font-medium">{user?.name || "Admin User"}</div>
              <div className="text-xs text-muted-foreground">
                {user?.email || "admin@omniblox.com"}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-medium">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "AD"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
