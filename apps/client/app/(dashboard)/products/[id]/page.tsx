"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useProductApi } from "@/hooks/use-product-api"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { use } from "react"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const { getProduct, deleteProduct } = useProductApi()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const productData = await getProduct(productId)
      setProduct(productData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      })
      router.push("/dashboard/products")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(product.id)
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
        router.push("/dashboard/products")
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">Loading product details...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">Product not found</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/products/${productId}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product "{product.name}" 
                  and remove all associated data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Product
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm font-medium">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">SKU</label>
                  <p className="text-sm font-mono">{product.sku}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-sm">{product.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Brand</label>
                  <p className="text-sm">{product.brand || "—"}</p>
                </div>
              </div>

              {product.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sale Price</label>
                <p className="text-lg font-semibold">
                  ${product.salePrice.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cost Price</label>
                <p className="text-sm">
                  ${product.costPrice.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stock Level</label>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{product.stock}</p>
                  {product.stock <= product.reorderLevel && (
                    <Badge variant="destructive">Low Stock</Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reorder Level</label>
                <p className="text-sm">{product.reorderLevel}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge 
                variant={
                  product.status === "ACTIVE" ? "default" : 
                  product.status === "INACTIVE" ? "secondary" : "destructive"
                }
                className="capitalize"
              >
                {product.status.toLowerCase()}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}