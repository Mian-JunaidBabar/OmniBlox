"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  FileText,
  Warehouse,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  ShoppingCart,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Tooltip as TooltipUI,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any | null>(null);
  useEffect(() => {
    let mounted = true;
    api
      .get("/dashboard/stats")
      .then((d) => {
        if (mounted) setDashboard(d);
      })
      .catch((err) => {
        // Keep static fallbacks on error; log for debugging
        console.warn("Failed to load dashboard stats:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const palette = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
  // Sales data for monthly chart (use API monthlySeries when available,
  // fall back to static sample data). Normalize the API shape to the
  // chart fields (sales/purchases/profit) so the chart works either way.
  const rawMonthlySeries = dashboard?.sales?.monthlySeries ?? [
    { month: "Jan", sales: 45000, purchases: 32000, profit: 13000 },
    { month: "Feb", sales: 52000, purchases: 35000, profit: 17000 },
    { month: "Mar", sales: 48000, purchases: 33000, profit: 15000 },
    { month: "Apr", sales: 61000, purchases: 40000, profit: 21000 },
    { month: "May", sales: 55000, purchases: 38000, profit: 17000 },
    { month: "Jun", sales: 67000, purchases: 42000, profit: 25000 },
  ];

  const monthlySalesData = rawMonthlySeries.map((e: any) => {
    // Server monthlySeries may use different keys (e.g. { month, invoices, revenue })
    const month = e.month || e.label || "";
    const sales = Number(e.revenue ?? e.sales ?? e.invoices ?? 0);
    const purchases = Number(e.purchases ?? 0);
    const profit = Number(e.profit ?? sales - purchases);
    return { month, sales, purchases, profit };
  });

  // Stock overview data for pie chart (from API or fallback static)
  const stockOverviewData = dashboard?.products?.stockOverviewByCategory?.map(
    (c: any, i: number) => ({
      name: c.categoryName || "Uncategorized",
      value: c.totalQuantity,
      color: palette[i % palette.length],
    })
  ) ?? [
    { name: "Electronics", value: 45, color: "#3b82f6" },
    { name: "Accessories", value: 28, color: "#10b981" },
    { name: "Software", value: 18, color: "#f59e0b" },
    { name: "Hardware", value: 32, color: "#8b5cf6" },
    { name: "Others", value: 15, color: "#ef4444" },
  ];

  // Best sellers mapped from API or fallback
  const bestSellers = dashboard?.products?.bestSellers?.map(
    (b: any, idx: number) => ({
      rank: idx + 1,
      product: b.name ?? b.productName ?? b.productId,
      sku: b.sku ?? "",
      sales: b.quantitySold ?? 0,
      revenue: b.revenue ? String(b.revenue) : "$0",
      growth: b.growth ?? "",
    })
  ) ?? [
    {
      rank: 1,
      product: 'Laptop Pro 15"',
      sku: "LP15-001",
      sales: 245,
      revenue: "$294,000",
      growth: "+15%",
    },
    {
      rank: 2,
      product: "Wireless Mouse",
      sku: "WM-002",
      sales: 892,
      revenue: "$44,600",
      growth: "+28%",
    },
    {
      rank: 3,
      product: "USB-C Cable",
      sku: "UC-003",
      sales: 1205,
      revenue: "$24,100",
      growth: "+42%",
    },
    {
      rank: 4,
      product: 'Monitor 27"',
      sku: "M27-004",
      sales: 156,
      revenue: "$62,400",
      growth: "+8%",
    },
    {
      rank: 5,
      product: "Keyboard Mechanical",
      sku: "KM-005",
      sales: 334,
      revenue: "$33,400",
      growth: "+22%",
    },
  ];

  // Top customers, suppliers, etc.
  interface TopCustomer {
    name: string;
    purchases: string;
    orders: number;
  }

  const topCustomers: TopCustomer[] = dashboard?.sales?.topCustomers?.map(
    (c: any) => ({
      name: c.name || c.customerName || "Unknown",
      purchases: c.total ? `$${c.total.toLocaleString()}` : "$0",
      orders: c.count ?? 0,
    })
  ) ?? [
    { name: "Acme Corp", purchases: "$45,230", orders: 23 },
    { name: "TechStart Inc", purchases: "$38,450", orders: 18 },
    { name: "Global Solutions", purchases: "$32,100", orders: 15 },
    { name: "Innovation Labs", purchases: "$28,900", orders: 12 },
    { name: "Digital Dynamics", purchases: "$25,600", orders: 10 },
  ];
  interface TopSupplier {
    name: string;
    supplies: string;
    orders: number;
  }

  const topSuppliers: TopSupplier[] = dashboard?.purchases?.topSuppliers?.map(
    (s: any) => ({
      name: s.name || "Unknown",
      supplies: s.total ? `$${s.total.toLocaleString()}` : "$0",
      orders: s.count ?? 0,
    })
  ) ?? [
    { name: "John Electronics Ltd", supplies: "$156,340", orders: 45 },
    { name: "Tech Supply Co", supplies: "$134,200", orders: 38 },
    { name: "Global Hardware Inc", supplies: "$98,750", orders: 32 },
    { name: "Parts Warehouse", supplies: "$87,400", orders: 28 },
    { name: "Component Direct", supplies: "$76,150", orders: 24 },
  ];

  // helper to format percent change and select color
  const formatChange = (
    prev: number | null | undefined,
    curr: number | null | undefined
  ) => {
    if (prev == null || curr == null)
      return { text: "—", className: "text-gray-600" };
    if (prev === 0) return { text: "—", className: "text-gray-600" };
    const diff = curr - prev;
    const pct = (diff / prev) * 100;
    const rounded = Math.abs(Number(pct.toFixed(1)));
    const sign = pct >= 0 ? "+" : "-";
    const className = pct >= 0 ? "text-green-600" : "text-red-600";
    return { text: `${sign}${rounded}%`, className };
  };

  const invoicesThisMonth = Number(
    dashboard?.sales?.invoicesThisMonth ?? monthlySalesData.at(-1)?.sales ?? 0
  );
  const prevInvoices = dashboard?.sales?.previousMonth?.invoices ?? null;
  const invoicesChange = formatChange(prevInvoices, invoicesThisMonth);

  const totalRevenue = Number(
    dashboard?.sales?.totalRevenue ?? monthlySalesData.at(-1)?.sales ?? 0
  );
  const prevRevenue = dashboard?.sales?.previousMonth?.revenue ?? null;
  const revenueChange = formatChange(prevRevenue, totalRevenue);

  const totalProducts = Number(dashboard?.products?.totalProducts ?? 0);
  const prevProducts =
    dashboard?.products?.previousMonth?.totalProducts ?? null;
  const productsChange = formatChange(prevProducts, totalProducts);

  const lowStock = Number(dashboard?.products?.lowStockCount ?? 0);
  const prevLowStock =
    dashboard?.products?.previousMonth?.lowStockCount ?? null;
  const lowStockChange = formatChange(prevLowStock, lowStock);

  const stats = [
    {
      title: "Total Products",
      value: String(totalProducts || "1,234"),
      changeText: productsChange.text,
      changeClass: productsChange.className,
      icon: Package,
    },
    {
      title: "Invoices This Month",
      value: String(invoicesThisMonth || "89"),
      changeText: invoicesChange.text,
      changeClass: invoicesChange.className,
      icon: FileText,
    },
    {
      title: "Low Stock Items",
      value: String(lowStock || "23"),
      changeText: lowStockChange.text,
      changeClass: lowStockChange.className,
      icon: Warehouse,
    },
    {
      title: "Revenue",
      value:
        dashboard?.sales?.totalRevenue != null
          ? `$${Number(dashboard.sales.totalRevenue).toLocaleString()}`
          : "$45,231",
      changeText: revenueChange.text,
      changeClass: revenueChange.className,
      icon: TrendingUp,
    },
  ];

  return (
    <div className=" space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Here's an overview of your business.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.changeClass}>{stat.changeText}</span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Monthly Sales Chart */}
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-gray-900">
                Monthly Sales Trend
              </CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              Revenue, purchases, and profit over time
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
                <Bar dataKey="purchases" fill="#10b981" name="Purchases" />
                <Bar dataKey="profit" fill="#f59e0b" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Overview Chart */}
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-gray-900">Stock Overview</CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              Stock distribution by category
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={stockOverviewData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }: any) => `${name}: ${value}`}
                >
                  {stockOverviewData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Section with Tabs */}
      <div className="mt-8">
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-gray-900">Top Performers</CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              Best performing entities across different categories
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="customers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="customers">Top Customers</TabsTrigger>
                <TabsTrigger value="suppliers">Top Suppliers</TabsTrigger>
                <TabsTrigger value="products">Best Sellers</TabsTrigger>
              </TabsList>

              <TabsContent value="customers" className="mt-6">
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {customer.orders} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {customer.purchases}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="suppliers" className="mt-6">
                <div className="space-y-4">
                  {topSuppliers.map((supplier, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {supplier.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {supplier.orders} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {supplier.supplies}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="products" className="mt-6">
                <div className="space-y-4">
                  {bestSellers.map((product: any) => (
                    <div
                      key={product.rank}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold">
                          {product.rank}
                        </div>
                        <div>
                          <TooltipUI>
                            <TooltipTrigger asChild>
                              <p className="font-semibold text-gray-800 truncate w-48">
                                {product.product}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span className="max-w-xs break-words">
                                {product.product}
                              </span>
                            </TooltipContent>
                          </TooltipUI>
                          <p className="text-sm text-gray-600">
                            {product.sku} • {product.sales} sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {product.revenue}
                        </p>
                        <p className="text-xs text-gray-600">
                          {product.growth}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-gray-900">Quick Actions</CardTitle>
            <CardDescription className="text-gray-600">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 text-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <div className="font-semibold text-gray-900">Add Product</div>
                <div className="text-xs text-gray-600">New inventory</div>
              </button>
              <button className="p-4 text-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <div className="font-semibold text-gray-900">
                  Create Invoice
                </div>
                <div className="text-xs text-gray-600">New sale</div>
              </button>
              <button className="p-4 text-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <div className="font-semibold text-gray-900">Add Customer</div>
                <div className="text-xs text-gray-600">New client</div>
              </button>
              <button className="p-4 text-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <div className="font-semibold text-gray-900">View Reports</div>
                <div className="text-xs text-gray-600">Analytics</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
