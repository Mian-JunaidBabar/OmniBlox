// Re-export types from lib for consistency
import type { Purchase } from "@/lib/types"
export type { Purchase }

export type PurchaseStatus = 

export type PurchaseStats = {
  totalPurchases: number
  activePurchases: number
  // Add more stats as needed
}

export type PurchaseFilters = {
  searchQuery: string
  statusFilter: string
}

export type PurchaseTableProps = {
  purchases: Purchase[]
  onPurchaseClick: (id: string) => void
}

export type PurchaseStatsCardsProps = {
  stats: PurchaseStats
}

export type PurchaseFiltersProps = {
  filters: PurchaseFilters
  onFiltersChange: (filters: PurchaseFilters) => void
}

export type PurchaseFormData = Omit<Purchase, "id">
