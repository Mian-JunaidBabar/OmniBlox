import { useAuthenticatedApi } from "./use-authenticated-api";
import type { Product } from "@/lib/types";

interface CreateProductData {
  name: string;
  sku: string;
  description?: string;
  category: string;
  brand?: string;
  salePrice: number;
  costPrice: number;
  stock: number;
  reorderLevel: number;
  status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
}

interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductListResponse {
  products: Product[];
  total: number;
  pages: number;
}

export interface ProductStats {
  totalProducts: number;
  lowStockCount: number;
  totalValue: number;
  categoriesCount: number;
}

interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

export function useProductApi() {
  const { post, get, put, delete: del } = useAuthenticatedApi();

  const createProduct = async (data: CreateProductData): Promise<Product> => {
    return post("/products", data) as Promise<Product>;
  };

  const getProducts = async (
    filters: ProductFilters = {}
  ): Promise<ProductListResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.status) params.set("status", filters.status);

    const query = params.toString();
    return get(
      `/products${query ? `?${query}` : ""}`
    ) as Promise<ProductListResponse>;
  };

  const getProduct = async (id: string): Promise<Product> => {
    return get(`/products/${id}`) as Promise<Product>;
  };

  const getProductBySku = async (sku: string): Promise<Product> => {
    return get(`/products/sku/${sku}`) as Promise<Product>;
  };

  const updateProduct = async (
    id: string,
    data: UpdateProductData
  ): Promise<Product> => {
    return put(`/products/${id}`, data) as Promise<Product>;
  };

  const deleteProduct = async (id: string): Promise<void> => {
    await del(`/products/${id}`);
  };

  const updateStock = async (
    id: string,
    quantity: number,
    operation: "add" | "subtract"
  ): Promise<Product> => {
    return put(`/products/${id}/stock`, {
      quantity,
      operation,
    }) as Promise<Product>;
  };

  const getCategories = async (): Promise<string[]> => {
    return get("/products/categories") as Promise<string[]>;
  };

  const getBrands = async (): Promise<string[]> => {
    return get("/products/brands") as Promise<string[]>;
  };

  const getLowStockProducts = async (): Promise<Product[]> => {
    return get("/products/low-stock") as Promise<Product[]>;
  };

  const getProductStats = async (): Promise<ProductStats> => {
    return get("/products/stats") as Promise<ProductStats>;
  };

  return {
    createProduct,
    getProducts,
    getProduct,
    getProductBySku,
    updateProduct,
    deleteProduct,
    updateStock,
    getCategories,
    getBrands,
    getLowStockProducts,
    getProductStats,
  };
}
