# Returns Reference Tracking - Complete Implementation

## Overview

Enhanced the returns module to support reference-based returns, allowing users to select existing sales/purchases and automatically populate return forms with the original transaction data. The system now tracks what has been returned from each transaction.

## Database Changes (Migration: `add-return-references`)

### New Fields Added

#### SalesReturn Model

- `saleId?: String` - Optional link to the original Sale
- Relation: `sale Sale?` - Access to original sale data

#### SalesReturnItem Model

- `saleItemId?: String` - Optional link to the original SaleItem
- Relation: `saleItem SaleItem?` - Track which specific item from the sale is being returned

#### PurchaseReturn Model

- `purchaseOrderId?: String` - Optional link to the original PurchaseOrder
- Relation: `purchaseOrder PurchaseOrder?` - Access to original purchase data

#### PurchaseReturnItem Model

- `purchaseOrderItemId?: String` - Optional link to the original PurchaseOrderItem
- Relation: `purchaseOrderItem PurchaseOrderItem?` - Track which specific item from the purchase is being returned

### Reverse Relations Added

#### Sale Model

- `returns SalesReturn[]` - Track all returns for this sale

#### SaleItem Model

- `returnedItems SalesReturnItem[]` - Track all return items for this sale item

#### PurchaseOrder Model

- `returns PurchaseReturn[]` - Track all returns for this purchase

#### PurchaseOrderItem Model

- `returnedItems PurchaseReturnItem[]` - Track all return items for this purchase item

## Backend Changes

### DTOs Updated

#### CreateSalesReturnDto

```typescript
{
  warehouseId: string;
  saleId?: string;  // NEW: Link to original sale
  reason?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    saleItemId?: string;  // NEW: Link to original sale item
  }>;
}
```

#### CreatePurchaseReturnDto

```typescript
{
  warehouseId: string;
  supplierId: string;
  purchaseOrderId?: string;  // NEW: Link to original purchase
  reason?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    purchaseOrderItemId?: string;  // NEW: Link to original purchase item
  }>;
}
```

### Services Updated

Both `sales-returns.service.ts` and `purchase-returns.service.ts` now:

- Accept optional reference IDs in create methods
- Pass through `saleId`/`purchaseOrderId` to database
- Pass through `saleItemId`/`purchaseOrderItemId` for each item
- Store these references for tracking and reporting

## Frontend Changes

### API Hooks Updated

#### use-sales-api.ts

- Already existed with `getSales()` and `getSale(id)` methods
- Returns sales with full item details for reference selection

#### use-purchases-api.ts

- Added `getById(id)` method to fetch single purchase with items
- Returns purchase with full item details for reference selection

#### use-returns-api.ts

- Updated type definitions to include optional reference fields
- Both `CreateSalesReturnDto` and `CreatePurchaseReturnDto` now support reference tracking

### Enhanced Returns Form (`/returns/new`)

#### New Features

1. **Reference Selection (Customer Returns)**

   - Dropdown to select existing sale at top of form
   - Shows: `Sale Reference - $Amount (Warehouse)`
   - Option for "Manual Entry (No Reference)"
   - Loads recent 100 sales when tab is active

2. **Reference Selection (Supplier Returns)**

   - Dropdown to select existing purchase at top of form
   - Shows: `Purchase Reference - Supplier Name $Amount`
   - Option for "Manual Entry (No Reference)"
   - Loads all available purchases when tab is active

3. **Auto-Fill Functionality**

   - **When Sale Selected:**

     - Auto-fills warehouse from sale
     - Pre-populates all items with products, quantities, and prices
     - Sets reason as "Return for sale [reference]"
     - Stores `saleId` and `saleItemId` for each item

   - **When Purchase Selected:**
     - Auto-fills warehouse and supplier from purchase
     - Pre-populates all items with products, quantities, and cost prices
     - Sets reason as "Return for purchase [reference]"
     - Stores `purchaseOrderId` and `purchaseOrderItemId` for each item

4. **Quantity Validation (Reference-Based)**

   - Tracks `maxQuantity` for each item (original quantity from transaction)
   - Shows "Qty (max: X)" label
   - Enforces maximum return quantity = original quantity
   - Prevents returning more than was sold/purchased

5. **Mixed Mode Support**

   - Users can select a reference AND still add manual items
   - Users can modify quantities (down to partial returns)
   - Users can edit prices if needed
   - "Add item" button still works for additional products

6. **Form State Management**
   - Warehouse/Supplier fields disabled when reference is selected
   - Fields become editable again if "Manual Entry" is chosen
   - Loading states while fetching sales/purchases
   - Visual feedback: "✓ Loaded from sale/purchase. You can adjust quantities below."

## User Workflow

### Option 1: Reference-Based Return (Customer)

1. Navigate to `/returns/new`
2. Stay on "Customer Return" tab
3. Select an existing sale from dropdown
4. System auto-populates warehouse and all items
5. Adjust quantities if doing partial return
6. Modify reason if needed
7. Click "Create Return"
8. Return is created with `saleId` and `saleItemId` references

### Option 2: Reference-Based Return (Supplier)

1. Navigate to `/returns/new`
2. Switch to "Supplier Return" tab
3. Select an existing purchase from dropdown
4. System auto-populates warehouse, supplier, and all items
5. Adjust quantities if doing partial return
6. Modify reason if needed
7. Click "Create Return"
8. Return is created with `purchaseOrderId` and `purchaseOrderItemId` references

### Option 3: Manual Entry (No Reference)

1. Navigate to `/returns/new`
2. Select "Manual Entry (No Reference)" from dropdown (or skip selection)
3. Manually select warehouse/supplier
4. Manually add products using "Add item" button
5. Enter quantities and prices manually
6. Click "Create Return"
7. Return is created without reference fields (saleId/purchaseOrderId remain null)

## Benefits

### For Users

- **Faster Data Entry**: No need to manually enter products, quantities, and prices
- **Reduced Errors**: Auto-filled data matches original transaction exactly
- **Quantity Control**: Can't accidentally return more than was sold/purchased
- **Flexible**: Can do full returns or partial returns with easy adjustment
- **Context**: Return reason auto-filled with transaction reference

### For Tracking & Reporting

- **Transaction History**: Every return is linked to its source transaction
- **Item-Level Tracking**: Know exactly which sale/purchase items are being returned
- **Analytics Ready**: Can calculate return rates per sale/purchase
- **Audit Trail**: Complete traceability from sale → return or purchase → return

### For Inventory Management

- **Accurate Stock Adjustments**: Returns properly track original transaction context
- **Warehouse Consistency**: Warehouse auto-selected from original transaction
- **Supplier Returns**: Proper tracking of what's being sent back to which supplier

## Technical Details

### Type Safety

- All reference IDs are properly typed as optional strings
- Frontend enforces quantity limits based on original transaction
- Backend validates all references exist before creating return

### Data Integrity

- Foreign keys with optional constraints
- Returns can exist without references (manual entry)
- Referenced items can exist without returns
- Cascade delete not used - returns persist even if source is deleted (for historical data)

### Performance

- Sales query limited to recent 100 for dropdown performance
- Purchases fetch all (typically smaller dataset)
- Single API call to fetch full sale/purchase with items
- Efficient state management with React hooks

## Future Enhancements

### Potential Features

1. **Return Limits Dashboard**

   - Show "Returnable Quantity" for each sale/purchase item
   - Calculate: original quantity - sum of returned quantities
   - Prevent duplicate returns beyond original amount

2. **Partial Return Tracking**

   - Visual indicator of partially returned items
   - "Return More" option for items with remaining quantity
   - Complete vs. partial return status

3. **Return Analytics**

   - Return rate per product
   - Return rate per customer/supplier
   - Most returned products report
   - Time-to-return analytics

4. **Smart Search**

   - Search sales/purchases by customer name
   - Filter by date range
   - Filter by status (completed only)

5. **Barcode Scanning**
   - Scan product barcodes directly into return form
   - Automatically match to sale/purchase items

## Testing Checklist

- [x] Backend migration applied successfully
- [x] Prisma client regenerated with new fields
- [x] DTOs updated and compiling
- [x] Services passing through reference fields
- [x] Frontend forms rendering correctly
- [x] Sale selection auto-fills customer return form
- [x] Purchase selection auto-fills supplier return form
- [x] Quantity limits enforced for reference-based returns
- [x] Manual entry still works without reference
- [ ] Test creating customer return from existing sale
- [ ] Test creating supplier return from existing purchase
- [ ] Test creating manual return (no reference)
- [ ] Test partial return (reduced quantities)
- [ ] Verify return data in database includes reference IDs
- [ ] Verify inventory updates correctly
- [ ] Test editing return quantities with max limit
- [ ] Verify returns list shows both types

## API Documentation

### Backend Endpoints (No Changes Required)

#### POST `/sales-returns`

**Now Accepts:**

```json
{
  "warehouseId": "uuid",
  "saleId": "uuid", // Optional
  "reason": "string",
  "items": [
    {
      "productId": "uuid",
      "quantity": 5,
      "unitPrice": 29.99,
      "saleItemId": "uuid" // Optional
    }
  ]
}
```

#### POST `/purchase-returns`

**Now Accepts:**

```json
{
  "warehouseId": "uuid",
  "supplierId": "uuid",
  "purchaseOrderId": "uuid", // Optional
  "reason": "string",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10,
      "unitPrice": 19.99,
      "purchaseOrderItemId": "uuid" // Optional
    }
  ]
}
```

## Files Modified

### Database

- `apps/server/prisma/schema.prisma` - Added reference fields and relations

### Backend

- `apps/server/src/sales-returns/dto/create-sales-return.dto.ts` - Added saleId, saleItemId
- `apps/server/src/purchase-returns/dto/create-purchase-return.dto.ts` - Added purchaseOrderId, purchaseOrderItemId
- `apps/server/src/sales-returns/sales-returns.service.ts` - Pass through references
- `apps/server/src/purchase-returns/purchase-returns.service.ts` - Pass through references

### Frontend

- `apps/client/hooks/use-returns-api.ts` - Updated type definitions
- `apps/client/hooks/use-purchases-api.ts` - Added getById method
- `apps/client/hooks/use-sales-api.ts` - Already had required methods
- `apps/client/app/(dashboard)/returns/new/page.tsx` - Complete rewrite with reference selection

## Migration Applied

```
Migration: 20251031141028_add_return_references
Status: ✓ Applied Successfully
```

---

**Implementation Date**: October 31, 2025
**Status**: ✅ Complete and Ready for Testing
**Breaking Changes**: None (all fields are optional)
