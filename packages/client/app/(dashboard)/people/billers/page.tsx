import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Building2, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"

const billers = [
  {
    id: "1",
    name: "Main Office",
    code: "MO-001",
    address: "123 Business St, New York, NY 10001",
    phone: "+1 234 567 8900",
    email: "main@omniblox.com",
    status: "active",
  },
  {
    id: "2",
    name: "Downtown Branch",
    code: "DB-002",
    address: "456 Commerce Ave, New York, NY 10002",
    phone: "+1 234 567 8901",
    email: "downtown@omniblox.com",
    status: "active",
  },
  {
    id: "3",
    name: "Warehouse Location",
    code: "WH-003",
    address: "789 Industrial Rd, Brooklyn, NY 11201",
    phone: "+1 234 567 8902",
    email: "warehouse@omniblox.com",
    status: "active",
  },
]

export default function BillersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Billers</h1>
        <p className="text-sm text-muted-foreground">Manage billing entities and branches</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div></div>
        <Link href="/people/billers/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Biller
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Billers</CardDescription>
            <CardTitle className="text-3xl">{billers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Locations</CardDescription>
            <CardTitle className="text-3xl text-emerald-600">
              {billers.filter((b) => b.status === "active").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Branches</CardDescription>
            <CardTitle className="text-3xl">{billers.length - 1}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Billers</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search billers..." className="pl-9 w-[300px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {billers.map((biller) => (
              <Link key={biller.id} href={`/people/billers/${biller.id}`}>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{biller.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">Code: {biller.code}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="max-w-xs">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{biller.address}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {biller.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {biller.email}
                        </span>
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
