import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

const customers = [
  {
    id: "1",
    name: "Acme Corp",
    email: "contact@acme.com",
    phone: "+1 234 567 8900",
    totalPurchases: 45000,
    creditLimit: 50000,
    balance: 5000,
    status: "active",
  },
  {
    id: "2",
    name: "TechStart Inc",
    email: "info@techstart.com",
    phone: "+1 234 567 8901",
    totalPurchases: 32000,
    creditLimit: 40000,
    balance: 0,
    status: "active",
  },
  {
    id: "3",
    name: "Global Solutions",
    email: "hello@global.com",
    phone: "+1 234 567 8902",
    totalPurchases: 68000,
    creditLimit: 75000,
    balance: 12000,
    status: "active",
  },
  {
    id: "4",
    name: "Innovation Labs",
    email: "contact@innovation.com",
    phone: "+1 234 567 8903",
    totalPurchases: 28000,
    creditLimit: 30000,
    balance: 2000,
    status: "active",
  },
]

export default function CustomersPage() {
  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalPurchases, 0)
  const totalCredit = customers.reduce((sum, c) => sum + c.balance, 0)
  const avgPurchase = totalRevenue / totalCustomers

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">Manage customer accounts and credit</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div></div>
        <Link href="/people/customers/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Customers</CardDescription>
            <CardTitle className="text-3xl">{totalCustomers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl">${totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Outstanding Credit</CardDescription>
            <CardTitle className="text-3xl text-amber-600">${totalCredit.toLocaleString()}</CardTitle>
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
            <CardTitle>All Customers</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search customers..." className="pl-9 w-[300px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {customers.map((customer) => (
              <Link key={customer.id} href={`/people/customers/${customer.id}`}>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {customer.email} • {customer.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Purchases</div>
                      <div className="font-semibold text-emerald-600">${customer.totalPurchases.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Credit Limit</div>
                      <div className="font-medium">${customer.creditLimit.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Balance Due</div>
                      <div className={`font-semibold ${customer.balance > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                        ${customer.balance.toLocaleString()}
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
