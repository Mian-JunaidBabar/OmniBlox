import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Shield, Mail, Phone } from "lucide-react"
import Link from "next/link"

const users = [
  {
    id: "1",
    name: "John Smith",
    email: "john@omniblox.com",
    phone: "+1 234 567 8900",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-15 10:30 AM",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@omniblox.com",
    phone: "+1 234 567 8901",
    role: "manager",
    status: "active",
    lastLogin: "2024-01-15 09:15 AM",
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike@omniblox.com",
    phone: "+1 234 567 8902",
    role: "staff",
    status: "active",
    lastLogin: "2024-01-14 04:20 PM",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@omniblox.com",
    phone: "+1 234 567 8903",
    role: "staff",
    status: "inactive",
    lastLogin: "2024-01-10 02:45 PM",
  },
]

const roleConfig = {
  admin: { label: "Admin", className: "bg-purple-100 text-purple-700 border-purple-200" },
  manager: { label: "Manager", className: "bg-blue-100 text-blue-700 border-blue-200" },
  staff: { label: "Staff", className: "bg-gray-100 text-gray-700 border-gray-200" },
}

const statusConfig = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  inactive: { label: "Inactive", className: "bg-gray-100 text-gray-700 border-gray-200" },
}

export default function UsersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Manage system users and permissions</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div></div>
        <Link href="/people/users/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Users</CardDescription>
            <CardTitle className="text-3xl text-emerald-600">
              {users.filter((u) => u.status === "active").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Admins</CardDescription>
            <CardTitle className="text-3xl">{users.filter((u) => u.role === "admin").length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Staff</CardDescription>
            <CardTitle className="text-3xl">{users.filter((u) => u.role === "staff").length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9 w-[300px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <Link key={user.id} href={`/people/users/${user.id}`}>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Last Login</div>
                      <div className="text-sm font-medium">{user.lastLogin}</div>
                    </div>
                    <Badge variant="outline" className={roleConfig[user.role as keyof typeof roleConfig].className}>
                      <Shield className="h-3 w-3 mr-1" />
                      {roleConfig[user.role as keyof typeof roleConfig].label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={statusConfig[user.status as keyof typeof statusConfig].className}
                    >
                      {statusConfig[user.status as keyof typeof statusConfig].label}
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
