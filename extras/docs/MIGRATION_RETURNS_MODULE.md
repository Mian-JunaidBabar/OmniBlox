# Returns Module - Database Migration Required

## Migration Command

After reviewing the schema changes, run this command to apply the migration:

```bash
cd apps/server
npx prisma migrate dev --name "feat-add-purchase-returns-and-return-status"
```

## Schema Changes Made

### 1. New `ReturnStatus` Enum
```prisma
enum ReturnStatus {
  PENDING
  PROCESSING
  COMPLETED
  CANCELLED
}
```

### 2. Updated `SalesReturn` Model
- Added `status` field (ReturnStatus, default: PENDING)
- Added `warehouseId` field and warehouse relation
- Now properly linked to warehouse for inventory management

### 3. New `PurchaseReturn` Model
Complete model for supplier returns with:
- Reference number, total amount, reason
- Status tracking (ReturnStatus enum)
- Links to: Company, User, Warehouse, Supplier
- Items relation (PurchaseReturnItem)

### 4. New `PurchaseReturnItem` Model
Line items for purchase returns with:
- Quantity, unit price
- Links to: Product, PurchaseReturn

### 5. Updated Relations
- Company → purchaseReturns
- User → purchaseReturns
- Warehouse → salesReturns, purchaseReturns
- Supplier → purchaseReturns
- Product → purchaseReturnItems

## Next Steps

1. Run the migration command above
2. Verify migration was successful: `npx prisma studio` (check new tables)
3. Regenerate Prisma Client: `npx prisma generate` (should happen automatically)
4. Proceed with backend API implementation
