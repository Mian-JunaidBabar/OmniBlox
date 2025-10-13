import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/products/${params.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-muted-foreground">Update product information</p>
          </div>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" defaultValue="Wireless Mouse" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Product Code *</Label>
                <Input id="code" defaultValue="WM-001" required />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select defaultValue="electronics">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Select defaultValue="logitech">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="logitech">Logitech</SelectItem>
                    <SelectItem value="microsoft">Microsoft</SelectItem>
                    <SelectItem value="razer">Razer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" defaultValue="High-quality wireless mouse with ergonomic design" rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost Price *</Label>
                <Input id="cost" type="number" step="0.01" defaultValue="15.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price *</Label>
                <Input id="price" type="number" step="0.01" defaultValue="29.99" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profit">Profit Margin</Label>
                <Input id="profit" value="49.97%" disabled />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input id="quantity" type="number" defaultValue="150" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-quantity">Alert Quantity</Label>
                <Input id="alert-quantity" type="number" defaultValue="20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select defaultValue="pcs">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warehouse & Tax</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse *</Label>
                <Select defaultValue="main">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Warehouse</SelectItem>
                    <SelectItem value="secondary">Secondary Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">Tax Rate (%)</Label>
                <Input id="tax" type="number" step="0.01" defaultValue="10.00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" defaultValue="123456789012" />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
