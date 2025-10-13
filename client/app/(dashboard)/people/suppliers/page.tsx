import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

const suppliers = [
  {
    id: "1",
    name: "Tech Supplies Ltd",
    email: "sales@techsupplies.com",
    phone: "+1 234 567 8900",
    totalPurchases: 125000,
    balance: 15000,
    status: "active",
  },
  {
    id: "2",
    name: "Hardware Inc",
    email: "orders@hardware.com",
    phone: "+1 234 567 8901",
    totalPurchases: 98000,
    balance: 0,
    status: "active",
  },
  {
    id: "3",
    name: "Electronics Co",
    email: "info@electronics.com",
    phone: "+1 234 567 8902",
    totalPurchases: 156000,
    balance: 22000,
    status: "active",
  },
  {
    id: "4",
    name: "Office Depot",
    email: "contact@officedepot.com",
    phone: "+1 234 567 8903",
    totalPurchases: 45000,
    balance: 5000,
    status: "active",
  },
]

export default function SuppliersPage() {
  const totalSuppliers = suppliers.length
  const totalPurchases = suppliers.reduce((sum, s) => sum + s.totalPurchases, 0)
  const totalPayable = suppliers.reduce((sum, s) => sum + s.balance, 0)
  const avgPurchase = totalPurchases / totalSuppliers

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Suppliers</h1>
        <p className="text-sm text-muted-foreground">Manage supplier accounts and payables</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div></div>
        <Link href="/people/suppliers/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Suppliers</CardDescription>
            <CardTitle className="text-3xl">{totalSuppliers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Purchases</CardDescription>
            <CardTitle className="text-3xl">${totalPurchases.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Accounts Payable</CardDescription>
            <CardTitle className="text-3xl text-red-600">${totalPayable.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Purchase</CardDescription>
            <CardTitle className="text-3xl">${avgPurchase.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Suppliers</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search suppliers..." className="pl-9 w-[300px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suppliers.map((supplier) => (
              <Link key={supplier.id} href={`/people/suppliers/${supplier.id}`}>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {supplier.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{supplier.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {supplier.email} • {supplier.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Purchases</div>
                      <div className="font-semibold">${supplier.totalPurchases.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Balance Payable</div>
                      <div className={`font-semibold ${supplier.balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        ${supplier.balance.toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      Active
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
