# Return Tracking Workflow - Complete Guide

## How Return Tracking Works

### Current Implementation

The return tracking system works as follows:

1. **Create Return (PENDING status)**
   - User creates a sales/purchase return with reference to original sale/purchase
   - Return is created with `PENDING` status by default
   - `saleId` / `purchaseOrderId` is stored
   - `saleItemId` / `purchaseOrderItemId` is stored for each item
   - **NO UPDATES** to original sale/purchase at this point

2. **Process Return (PROCESSING status)**
   - User marks return as "Processing"
   - **NO UPDATES** to original sale/purchase at this point

3. **Complete Return (COMPLETED status)** ✅
   - User clicks "Mark as Completed"
   - **THIS IS WHEN THE MAGIC HAPPENS:**
     - Inventory is updated (added for sales returns, subtracted for purchase returns)
     - `returnedQuantity` is incremented on each original sale/purchase item
     - `hasReturns` flag is set to `true` on the original sale/purchase
   - The original invoice now shows return indicators in the UI

4. **Cancel Return (CANCELLED status)**
   - If a COMPLETED return is cancelled:
     - Inventory changes are reversed
     - `returnedQuantity` is decremented
     - `hasReturns` is updated (removed if no other returns exist)

5. **Reset Return (PENDING status)**
   - If a COMPLETED return is reset to PENDING:
     - Same as cancellation - inventory and tracking are reversed

## Why Returns Might Not Show on Original Invoices

### Issue: Returns Staying in PENDING Status

If returns are created but never marked as COMPLETED, the original sales/purchases will NOT show:
- ❌ `hasReturns` badge in sales/purchases list
- ❌ `returnedQuantity` in item details
- ❌ Inventory updates

### Solution: Complete the Return Workflow

**USERS MUST:**
1. Create the return with reference to original sale/purchase
2. **Click "Start Processing" or directly "Mark as Completed"**
3. Only when status is COMPLETED will the tracking update

## Testing the Complete Workflow

### Test Scenario: Sales Return

1. **Create a Sale**
   - Create a sale with 10 units of Product A
   - Note the sale ID and item IDs

2. **Create a Sales Return**
   - Go to Returns → New Return → Customer Return tab
   - Select "Use existing sale as reference"
   - Select the sale created in step 1
   - Items will auto-populate with max returnable quantities
   - Enter quantity to return (e.g., 3 units)
   - Submit the return

3. **Check Sale Status** ❌
   - Go back to the original sale
   - At this point: `hasReturns` = false
   - Item `returnedQuantity` = 0
   - **REASON: Return is still PENDING**

4. **Complete the Return** ✅
   - Go to Returns list
   - Click on the return created in step 2
   - Click "Start Processing" (optional) or "Mark as Completed"
   - Return status changes to COMPLETED

5. **Verify Sale Updated** ✅
   - Go back to the original sale
   - Sale list should show "Has Returns" badge in orange
   - Sale detail page should show returned quantity (3) in orange for Product A
   - Inventory should be updated (+3 units added back)

### Test Scenario: Purchase Return

Same workflow but with purchases:
1. Create purchase order
2. Create purchase return with reference
3. Return stays PENDING → **NO tracking on purchase**
4. Mark return as COMPLETED → **Tracking updates, inventory decreases**

## Code Verification

### Backend Logic (Already Implemented ✅)

**apps/server/src/sales-returns/sales-returns.service.ts**
```typescript
// Lines 209-247: When status changes to COMPLETED
if (newStatus === 'COMPLETED' && existing.status !== 'COMPLETED') {
  // Increment inventory
  for (const item of updated.items) {
    await tx.inventory.upsert({...});
    
    // Update returned quantity on original sale item
    if (item.saleItemId) {
      await tx.saleItem.update({
        where: { id: item.saleItemId },
        data: {
          returnedQuantity: {
            increment: item.quantity,
          },
        },
      });
    }
  }

  // Mark the sale as having returns
  if (updated.saleId) {
    await tx.sale.update({
      where: { id: updated.saleId },
      data: { hasReturns: true },
    });
  }
}
```

### Frontend UI (Already Implemented ✅)

**apps/client/app/(dashboard)/returns/[id]/page.tsx**
- Status change buttons (lines 383-431)
- "Start Processing" button
- "Mark as Completed" button
- Status update handler (lines 165-189)

**apps/client/app/(dashboard)/sales/page.tsx**
- "Has Returns" badge display (line 295)

**apps/client/app/(dashboard)/sales/[id]/page.tsx**
- Returned quantity column (line 214-218)

## User Training Required

### Key Points to Communicate:

1. **Creating a return does NOT automatically update the original invoice**
2. **Returns must be COMPLETED to trigger tracking updates**
3. **Workflow steps:**
   - Create Return → Start Processing → Mark as Completed
4. **Visual indicators will only appear after completion**
5. **Cancelling/Resetting a completed return will reverse the tracking**

## Recommendations

### Option 1: Auto-Complete Returns (Simplest)
Change the default status from PENDING to COMPLETED when creating returns with references.

**Pros:**
- Immediate tracking
- Less clicks for users
- Inventory updates right away

**Cons:**
- Less control over workflow
- Can't review before completing

### Option 2: Add Warning Banner (Recommended)
Add a prominent warning on return detail page when status is PENDING:

"⚠️ This return has not been completed yet. The original sale/purchase will not show return indicators until you mark this return as COMPLETED."

### Option 3: Batch Complete Action
Add a "Complete" button directly on the returns list page for quick completion of multiple returns.

## Summary

The return tracking system is **working correctly** ✅

The "issue" is a **workflow understanding gap**:
- Users expect tracking immediately upon return creation
- System requires returns to be COMPLETED for tracking
- This is by design for proper workflow control

**Solution:** User training + optional UI improvements (warning banners)
