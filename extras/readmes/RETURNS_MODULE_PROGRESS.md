# Returns Module - Frontend Progress Update

## ✅ Completed

### 1. Returns List Page (`/returns/page.tsx`)

**Status:** ✅ Complete and connected to backend

**Features:**

- Real-time data fetching from `getAllReturns()` API
- Loading and error states with UI feedback
- Search functionality (by reference number, reason, supplier name)
- Stats cards showing:
  - Total returns count
  - Total value
  - Customer returns count (red-themed)
  - Supplier returns count (green-themed)
- List view with:
  - Type badges (Customer Return / Supplier Return)
  - Return date formatted with date-fns
  - Item count and total amount
  - Status badges (PENDING, PROCESSING, COMPLETED, CANCELLED)
  - Clickable links to detail pages: `/returns/${type}/${id}`

### 2. Type Selection Page (`/returns/new/page.tsx`)

**Status:** ✅ Complete

**Features:**

- Two card-based options:
  - Customer Return (red-themed with TrendingDown icon)
  - Supplier Return (green-themed with TrendingUp icon)
- Each card includes:
  - Description of what the return type is for
  - List of key features/use cases
  - Call-to-action button
- Help section explaining the difference
- Routes to:
  - `/returns/new/customer` for customer returns
  - `/returns/new/supplier` for supplier returns

### 3. API Integration (`/hooks/use-returns-api.ts`)

**Status:** ✅ Complete

**Available Functions:**

- `getAllReturns()` - Get unified list of both return types
- `getSalesReturn(id)` - Get single customer return
- `createSalesReturn(data)` - Create customer return
- `updateSalesReturn(id, data)` - Update customer return
- `deleteSalesReturn(id)` - Delete customer return
- `updateSalesReturnStatus(id, status)` - Update customer return status
- `getPurchaseReturn(id)` - Get single supplier return
- `createPurchaseReturn(data)` - Create supplier return
- `updatePurchaseReturn(id, data)` - Update supplier return
- `deletePurchaseReturn(id)` - Delete supplier return
- `updatePurchaseReturnStatus(id, status)` - Update supplier return status

## ⏳ Next Steps

### 3. Customer Return Form (`/returns/new/customer/page.tsx`)

**Priority:** High - Next immediate task

**Requirements:**

- Form fields:
  - Reference number (auto-generated or manual)
  - Return date (date picker)
  - Warehouse selection (dropdown)
  - Reason for return (textarea)
  - Notes (textarea, optional)
- Items section with add/remove capability:
  - Product selection (dropdown with search)
  - Quantity (number input)
  - Unit price (auto-filled from product, editable)
  - Subtotal (calculated)
- Total amount calculation
- Submit to `createSalesReturn()` API
- Redirect to detail page on success
- Show loading state during submission
- Error handling with toast notifications

**API Payload Example:**

```typescript
{
  warehouseId: "warehouse-uuid",
  returnDate: "2024-01-15",
  reason: "Defective product",
  notes: "Customer reported screen issues",
  items: [
    {
      productId: "product-uuid",
      quantity: 2,
      unitPrice: 49.99,
      notes: "Display defect"
    }
  ]
}
```

### 4. Supplier Return Form (`/returns/new/supplier/page.tsx`)

**Priority:** High

**Requirements:**
Similar to customer return form, but with:

- Supplier selection instead of customer
- Warehouse selection
- Purchase order reference (optional)
- Expected refund/replacement selection
- Submit to `createPurchaseReturn()` API

**API Payload Example:**

```typescript
{
  supplierId: "supplier-uuid",
  warehouseId: "warehouse-uuid",
  returnDate: "2024-01-15",
  reason: "Wrong items shipped",
  notes: "Supplier to send replacement",
  items: [
    {
      productId: "product-uuid",
      quantity: 5,
      unitPrice: 25.00,
      notes: "Incorrect model received"
    }
  ]
}
```

### 5. Return Detail Page (`/returns/[type]/[id]/page.tsx`)

**Priority:** Medium

**Requirements:**

- Dynamic route handling for both customer and supplier returns
- Fetch data based on type:
  - If type === "customer", call `getSalesReturn(id)`
  - If type === "supplier", call `getPurchaseReturn(id)`
- Display all return information:
  - Header with reference number and status badge
  - Return details (date, reason, notes)
  - Customer/Supplier info
  - Warehouse info
  - Items table with columns:
    - Product name
    - Quantity
    - Unit price
    - Subtotal
    - Item notes
  - Total amount
- Action buttons (visible only to MANAGER+):
  - Edit button → routes to edit page
  - Status update dropdown (PENDING → PROCESSING → COMPLETED)
  - Delete button with confirmation dialog
- Back button to returns list

### 6. Return Edit Page (`/returns/[type]/[id]/edit/page.tsx`)

**Priority:** Medium

**Requirements:**

- Similar form to create page but pre-filled with existing data
- Fetch existing return on mount
- Allow editing all fields except reference number
- Submit to `updateSalesReturn()` or `updatePurchaseReturn()`
- Redirect to detail page on success

## 📋 Backend Status

**Status:** ✅ Complete - Ready for migration

### ⚠️ Important: Migration Required

Before testing the backend, run:

```bash
cd apps/server
npx prisma migrate dev --name "feat-add-purchase-returns"
```

### Available Endpoints

#### Sales Returns (Customer Returns)

- `POST /sales-returns` - Create customer return (MANAGER+)
- `GET /sales-returns` - List all customer returns (ALL_STAFF)
- `GET /sales-returns/:id` - Get single customer return (ALL_STAFF)
- `PUT /sales-returns/:id` - Update customer return (MANAGER+)
- `PATCH /sales-returns/:id/status` - Update status (MANAGER+)
- `DELETE /sales-returns/:id` - Delete customer return (MANAGER+)

#### Purchase Returns (Supplier Returns)

- `POST /purchase-returns` - Create supplier return (MANAGER+)
- `GET /purchase-returns` - List all supplier returns (ALL_STAFF)
- `GET /purchase-returns/:id` - Get single supplier return (ALL_STAFF)
- `PUT /purchase-returns/:id` - Update supplier return (MANAGER+)
- `PATCH /purchase-returns/:id/status` - Update status (MANAGER+)
- `DELETE /purchase-returns/:id` - Delete supplier return (MANAGER+)

#### Unified Returns

- `GET /returns` - Get all returns (both types merged with `type` discriminator)

### Inventory Updates

- ✅ Customer returns: Automatically **increment** inventory (adds stock back)
- ✅ Supplier returns: Automatically **decrement** inventory (removes stock)
- ✅ Atomic operations using Prisma's `increment`/`decrement`
- ✅ Wrapped in transactions for consistency

## 🎨 Design Patterns Established

### Type Discriminator

```typescript
type UnifiedReturn = {
  ...returnData,
  type: 'customer' | 'supplier'
}
```

### Dynamic Routing

```
/returns                        → List all returns
/returns/new                    → Select return type
/returns/new/customer          → Create customer return form
/returns/new/supplier          → Create supplier return form
/returns/customer/:id          → Customer return detail
/returns/supplier/:id          → Supplier return detail
/returns/customer/:id/edit     → Edit customer return
/returns/supplier/:id/edit     → Edit supplier return
```

### Status Colors

- PENDING: Amber (bg-amber-100, text-amber-700)
- PROCESSING: Blue (bg-blue-100, text-blue-700)
- COMPLETED: Emerald (bg-emerald-100, text-emerald-700)
- CANCELLED: Red (bg-red-100, text-red-700)

### Type Colors

- Customer Return: Red theme (TrendingDown icon)
- Supplier Return: Green theme (TrendingUp icon)

## 📝 Testing Checklist (After Migration)

- [ ] Run database migration
- [ ] Test returns list page loads
- [ ] Test search functionality
- [ ] Test stats calculations
- [ ] Test creating customer return
- [ ] Test creating supplier return
- [ ] Verify inventory increments for customer returns
- [ ] Verify inventory decrements for supplier returns
- [ ] Test viewing return details
- [ ] Test editing returns
- [ ] Test status updates
- [ ] Test deletion with confirmation
- [ ] Test RBAC (STAFF can view, only MANAGER+ can create/edit/delete)

## 🔗 Related Files

### Backend

- `apps/server/prisma/schema.prisma` - Database schema with ReturnStatus and models
- `apps/server/src/sales-returns/` - Customer returns module
- `apps/server/src/purchase-returns/` - Supplier returns module
- `apps/server/src/returns/` - Unified returns module
- `apps/server/src/app.module.ts` - Module registration

### Frontend

- `apps/client/hooks/use-returns-api.ts` - API integration
- `apps/client/app/(dashboard)/returns/page.tsx` - List view
- `apps/client/app/(dashboard)/returns/new/page.tsx` - Type selection

### Documentation

- `extras/docs/MIGRATION_RETURNS_MODULE.md` - Migration guide
