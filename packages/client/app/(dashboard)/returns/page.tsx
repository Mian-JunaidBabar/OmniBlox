import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const returns = [
  { id: 'RET-001', type: 'customer', customer: 'Acme Corp', date: '2024-01-15', amount: 1200, status: 'pending', items: 2 },
  { id: 'RET-002', type: 'supplier', supplier: 'Tech Supplies Ltd', date: '2024-01-14', amount: 3500, status: 'completed', items: 5 },
  { id: 'RET-003', type: 'customer', customer: 'Global Solutions', date: '2024-01-13', amount: 850, status: 'completed', items: 1 },
  { id: 'RET-004', type: 'supplier', supplier: 'Hardware Inc', date: '2024-01-12', amount: 2200, status: 'pending', items: 3 },
  { id: 'RET-005', type: 'customer', customer: 'Innovation Labs', date: '2024-01-11', amount: 1500, status: 'processing', items: 2 },
]

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
}

export default function ReturnsPage() {
  const totalReturns = returns.length
  const totalValue = returns.reduce((sum, r) => sum + r.amount, 0)
  const customerReturns = returns.filter(r => r.type === 'customer').length
  const supplierReturns = returns.filter(r => r.type === 'supplier').length

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Returns</h1>
        <p className="text-sm text-muted-foreground">Manage customer and supplier returns</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div></div>
        <Link href="/returns/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Return
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Returns</CardDescription>
            <CardTitle className="text-3xl">{totalReturns}</CardTitle>
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
            <CardDescription>Customer Returns</CardDescription>
            <CardTitle className="text-3xl text-red-600">{customerReturns}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Supplier Returns</CardDescription>
            <CardTitle className="text-3xl text-emerald-600">{supplierReturns}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Returns</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search returns..." className="pl-9 w-[300px]" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {returns.map((returnItem) => (
              <Link key={returnItem.id} href={`/returns/${returnItem.id}`}>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      returnItem.type === 'customer' ? 'bg-red-100' : 'bg-emerald-100'
                    }`}>
                      {returnItem.type === 'customer' ? (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{returnItem.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {'customer' in returnItem ? returnItem.customer : returnItem.supplier}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Badge variant="outline" className={returnItem.type === 'customer' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}>
                      {returnItem.type === 'customer' ? 'Customer Return' : 'Supplier Return'}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Date</div>
                      <div className="font-medium">{returnItem.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Items</div>
                      <div className="font-medium">{returnItem.items}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Amount</div>
                      <div className="font-semibold">${returnItem.amount.toLocaleString()}</div>
                    </div>
                    <Badge variant="outline" className={statusConfig[returnItem.status as keyof typeof statusConfig].className}>
                      {statusConfig[returnItem.status as keyof typeof statusConfig].label}
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
