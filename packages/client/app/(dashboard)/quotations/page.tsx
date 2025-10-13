import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

const quotations = [
  { id: 'QT-001', customer: 'Acme Corp', date: '2024-01-15', total: 15000, status: 'pending', items: 5 },
  { id: 'QT-002', customer: 'TechStart Inc', date: '2024-01-14', total: 8500, status: 'accepted', items: 3 },
  { id: 'QT-003', customer: 'Global Solutions', date: '2024-01-13', total: 22000, status: 'rejected', items: 8 },
  { id: 'QT-004', customer: 'Innovation Labs', date: '2024-01-12', total: 12500, status: 'pending', items: 4 },
  { id: 'QT-005', customer: 'Digital Dynamics', date: '2024-01-11', total: 18000, status: 'accepted', items: 6 },
]

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-amber-100 text-amber-700 border-amber-200' },
  accepted: { label: 'Accepted', icon: CheckCircle, className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-700 border-red-200' },
}

export default function QuotationsPage() {
  const totalQuotations = quotations.length
  const totalValue = quotations.reduce((sum, q) => sum + q.total, 0)
  const pendingCount = quotations.filter(q => q.status === 'pending').length
  const acceptedCount = quotations.filter(q => q.status === 'accepted').length

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Quotations</h1>
        <p className="text-sm text-muted-foreground">Manage customer quotations and proposals</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div></div>
        <Link href="/quotations/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Quotation
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Quotations</CardDescription>
            <CardTitle className="text-3xl">{totalQuotations}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Value</CardDescription>
            <CardTitle className="text-3xl">${totalValue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-amber-600">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Accepted</CardDescription>
            <CardTitle className="text-3xl text-emerald-600">{acceptedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Quotations</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search quotations..." className="pl-9 w-[300px]" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quotations.map((quotation) => {
              const StatusIcon = statusConfig[quotation.status as keyof typeof statusConfig].icon
              return (
                <Link key={quotation.id} href={`/quotations/${quotation.id}`}>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{quotation.id}</div>
                        <div className="text-sm text-muted-foreground">{quotation.customer}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Date</div>
                        <div className="font-medium">{quotation.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Items</div>
                        <div className="font-medium">{quotation.items}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="font-semibold">${quotation.total.toLocaleString()}</div>
                      </div>
                      <Badge variant="outline" className={statusConfig[quotation.status as keyof typeof statusConfig].className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[quotation.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
