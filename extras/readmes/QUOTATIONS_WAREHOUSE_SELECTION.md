# Quotation to Sale Conversion - Warehouse Selection Feature

## Overview

Enhanced the quotation-to-sale conversion flow to allow users to select a warehouse and view real-time stock availability before converting. This prevents failed conversions due to insufficient inventory and provides transparency about stock levels across warehouses.

## Changes Made

### Backend Changes

#### 1. QuotationsService (`apps/server/src/quotations/quotations.service.ts`)

- **Modified `convertToSale` method**: Now accepts an optional `warehouseId` parameter
  - If provided, validates the warehouse belongs to the company
  - Falls back to first available warehouse if not provided
- **New `getStockLevels` method**: Returns stock availability for all quotation items across all warehouses
  - Fetches all company warehouses
  - Queries inventory for each product in each warehouse
  - Calculates if each warehouse can fulfill the entire order
  - Returns detailed breakdown:
    - Per-warehouse stock levels
    - Per-product required vs available quantities
    - Boolean `canFulfill` flag for each warehouse

#### 2. QuotationsController (`apps/server/src/quotations/quotations.controller.ts`)

- **Updated `convertToSale` endpoint**: Now accepts `{ warehouseId?: string }` in request body
- **New endpoint**: `GET /quotations/:id/stock-levels`
  - Returns stock availability data
  - Accessible to all authenticated roles

### Frontend Changes

#### 1. useQuotationsApi Hook (`apps/client/hooks/use-quotations-api.ts`)

- **Updated `convertQuotationToSale`**: Now requires `warehouseId` parameter
- **New function**: `getQuotationStockLevels(id)` - fetches stock availability data

#### 2. Quotation Detail Page (`apps/client/app/(dashboard)/quotations/[id]/page.tsx`)

**State Management:**

- Added `stockLevels` state for warehouse/inventory data
- Added `selectedWarehouse` state for user's warehouse choice
- Added `loadingStock` state for loading indicator

**UI Components Added:**

- Warehouse selection dropdown with stock status badges
- Real-time stock level display for selected warehouse
- Per-product availability breakdown showing:
  - Product name and SKU
  - Required quantity
  - Available quantity
  - Visual indicators (green checkmark / red X)
- Warning banner when selected warehouse has insufficient stock
- "Can Fulfill" / "Insufficient Stock" badges on each warehouse option

**Error Handling:**

- Improved error message extraction from API responses
- Now displays actual server error messages (e.g., "Insufficient stock for product X")
- Added console logging for debugging conversion failures

**User Flow:**

1. User clicks "Convert to Sale" on an accepted quotation
2. Dialog opens and automatically fetches stock levels for all warehouses
3. System auto-selects the first warehouse that can fulfill the order (if any)
4. User can review stock levels and switch warehouses if needed
5. "Convert to Sale" button is disabled if selected warehouse cannot fulfill
6. Upon successful conversion, user is navigated to the new sale detail page

## API Response Examples

### Stock Levels Response

```json
{
  "quotationId": "...",
  "referenceNumber": "QT-000001",
  "warehouses": [
    {
      "warehouseId": "...",
      "warehouseName": "Main Warehouse",
      "location": "Building A",
      "canFulfill": true,
      "products": [
        {
          "productId": "...",
          "productName": "Product A",
          "sku": "SKU-001",
          "required": 10,
          "available": 50,
          "sufficient": true
        }
      ]
    }
  ]
}
```

### Convert to Sale Request

```json
POST /quotations/:id/convert-to-sale
{
  "warehouseId": "warehouse-uuid-here"
}
```

## User Experience Improvements

### Before

- ❌ Generic error message: "Failed to convert quotation to sale"
- ❌ No visibility into which warehouse would be used
- ❌ No way to check stock levels before attempting conversion
- ❌ Conversion would fail silently if stock was insufficient

### After

- ✅ Clear warehouse selection with stock status
- ✅ Real-time stock level display for all products
- ✅ Visual indicators for stock sufficiency
- ✅ Specific error messages (e.g., "Insufficient stock for product X in Warehouse Y")
- ✅ Prevents conversion attempts when stock is insufficient
- ✅ Auto-selects best warehouse option
- ✅ Warnings before proceeding with insufficient stock

## Testing Checklist

- [x] Backend: `getStockLevels` returns correct data for multiple warehouses
- [x] Backend: `convertToSale` respects warehouse selection
- [x] Backend: Error messages are clear and specific
- [x] Frontend: Stock levels load automatically on dialog open
- [x] Frontend: Warehouse selection updates stock display
- [x] Frontend: Convert button disabled for insufficient stock
- [x] Frontend: Auto-selects warehouse that can fulfill
- [x] Frontend: Error messages display correctly
- [x] TypeScript: No compilation errors
- [ ] Manual: Test with single warehouse
- [ ] Manual: Test with multiple warehouses
- [ ] Manual: Test with insufficient stock
- [ ] Manual: Test with sufficient stock in only one warehouse
- [ ] Manual: Verify sale is created with correct warehouse

## Future Enhancements

1. **Partial Fulfillment**: Allow splitting an order across multiple warehouses
2. **Stock Reservation**: Temporarily reserve stock when quotation is accepted
3. **Stock History**: Show recent stock movements for context
4. **Reorder Suggestions**: Highlight products below reorder level
5. **Warehouse Performance**: Track which warehouses fulfill most orders
6. **Multi-location Shipping**: Support shipping from multiple warehouses to one customer

## Related Files

### Backend

- `apps/server/src/quotations/quotations.service.ts`
- `apps/server/src/quotations/quotations.controller.ts`

### Frontend

- `apps/client/app/(dashboard)/quotations/[id]/page.tsx`
- `apps/client/hooks/use-quotations-api.ts`

## Notes

- The conversion process remains atomic - inventory is decremented in a single transaction
- If no warehouse is selected (shouldn't happen due to UI validation), backend falls back to first warehouse
- Stock levels are fetched fresh each time the dialog opens to ensure accuracy
- The dialog is scrollable for quotations with many items or warehouses
