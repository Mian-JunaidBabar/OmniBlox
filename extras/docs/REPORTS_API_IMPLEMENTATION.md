# Reports API - Complete Implementation Guide

## Overview

This document provides a comprehensive guide to the Reports API backend and frontend implementation. The Reports module offers 5 major report categories with real-time data aggregation using Prisma's powerful query capabilities.

## Backend Implementation

### Phase 1: Financial Summary Report ✅

**Endpoint:** `POST /reports/financial-summary`  
**Access:** OWNER, ADMIN, MANAGER

#### Features Implemented:

- ✅ Total Revenue calculation from sales
- ✅ Cost of Goods Sold (COGS) computation using product cost prices
- ✅ Gross Profit and Net Profit calculations
- ✅ Profit margins (Gross and Net)
- ✅ Revenue by Category with profit margins
- ✅ Profit & Loss (P&L) chart data with date grouping
- ✅ Tax collected tracking

#### Key Metrics:

```typescript
{
  totalRevenue: number,      // Sum of all sales
  totalCOGS: number,          // Cost of goods sold
  grossProfit: number,        // Revenue - COGS
  totalExpenses: number,      // Sum of all expenses
  netProfit: number,          // Gross profit - expenses
  grossMargin: number,        // (Gross profit / Revenue) * 100
  netMargin: number,          // (Net profit / Revenue) * 100
  taxCollected: number        // Total tax from sales
}
```

---

### Phase 2: Inventory & Sales Reports ✅

#### Inventory Summary

**Endpoint:** `POST /reports/inventory-summary`  
**Access:** MANAGER and above

**Features Implemented:**

- ✅ Total Products count
- ✅ Total Stock Value (quantity × cost price)
- ✅ Total Retail Value (quantity × sale price)
- ✅ Potential Profit calculation
- ✅ Low Stock Items detection (below reorder level)
- ✅ Stock by Warehouse breakdown
- ✅ Recent Stock Adjustments tracking

#### Sales Summary

**Endpoint:** `POST /reports/sales-summary`  
**Access:** MANAGER and above

**Features Implemented:**

- ✅ Total Sales and Order Count
- ✅ Average Order Value
- ✅ New Customers count
- ✅ Top Selling Products (by quantity and revenue)
- ✅ Sales by Status breakdown
- ✅ Sales by Payment Status breakdown

---

### Phase 3: Staff & Tax Reports ✅

#### Staff Performance

**Endpoint:** `POST /reports/staff-performance`  
**Access:** OWNER and ADMIN only

**Features Implemented:**

- ✅ Revenue generated per staff member
- ✅ Order count per staff
- ✅ Average order value per staff
- ⚠️ Sales target tracking (requires schema update)

**Note:** To enable full target tracking, add the following field to the User model:

```prisma
model User {
  // ... existing fields
  salesTarget Decimal? @db.Decimal(10, 2)
}
```

Then run: `npx prisma migrate dev --name add-sales-target`

#### Tax Summary

**Endpoint:** `POST /reports/tax-summary`  
**Access:** MANAGER and above

**Features Implemented:**

- ✅ Total Tax Collected from sales
- ✅ Transaction count
- ✅ Tax trend over time
- ⚠️ Tax Paid tracking (requires schema update)

**Note:** To enable tax paid tracking, add tax fields to PurchaseOrder and Expense models:

```prisma
model PurchaseOrder {
  // ... existing fields
  tax Decimal? @db.Decimal(10, 2) @default(0)
}

model Expense {
  // ... existing fields
  tax Decimal? @db.Decimal(10, 2) @default(0)
}
```

Then run: `npx prisma migrate dev --name add-tax-fields`

---

## Frontend Implementation

### Reports Service

**Location:** `apps/client/services/reports.service.ts`

The service provides type-safe API calls for all report endpoints:

```typescript
// Fetch all reports in parallel
const [financial, inventory, sales, staff, tax] =
  await reportsService.getAllReports({
    startDate: "2024-01-01",
    endDate: "2024-12-31",
  });
```

### Reports Page Component

**Location:** `apps/client/app/(dashboard)/reports/page.tsx`

#### Key Features:

- ✅ Dynamic data fetching with loading states
- ✅ Date range selection and validation
- ✅ Real-time chart rendering (Line, Bar, Pie)
- ✅ Export functionality (JSON format)
- ✅ Error handling with toast notifications
- ✅ Responsive design
- ✅ Tab-based navigation
- ✅ Empty state handling

#### State Management:

```typescript
const [financialData, setFinancialData] = useState<FinancialSummary | null>(
  null
);
const [inventoryData, setInventoryData] = useState<InventorySummary | null>(
  null
);
const [salesData, setSalesData] = useState<SalesSummary | null>(null);
const [staffData, setStaffData] = useState<StaffPerformance | null>(null);
const [taxData, setTaxData] = useState<TaxSummary | null>(null);
```

---

## Performance Optimizations

### Backend:

1. **Parallel Queries:** All aggregations run in parallel using `Promise.all()`
2. **Efficient Grouping:** Uses Prisma's `groupBy()` for category/warehouse breakdowns
3. **Selective Fields:** Only fetches required fields using `select`
4. **Indexed Queries:** Relies on database indexes on `companyId`, `saleDate`, `expenseDate`

### Frontend:

1. **Lazy Loading:** Reports only fetch on user action
2. **State Caching:** Data persists across tab switches
3. **Chart Optimization:** Uses ResponsiveContainer for adaptive sizing
4. **Debounced Actions:** Prevents duplicate API calls

---

## API Response Examples

### Financial Summary Response:

```json
{
  "summary": {
    "totalRevenue": 328000,
    "totalCOGS": 180000,
    "grossProfit": 148000,
    "totalExpenses": 40000,
    "netProfit": 108000,
    "grossMargin": 45.1,
    "netMargin": 32.9,
    "orderCount": 1456,
    "expenseCount": 245,
    "taxCollected": 32800
  },
  "revenueByCategory": [
    {
      "categoryId": "uuid",
      "categoryName": "Electronics",
      "revenue": 150000,
      "cogs": 85000,
      "profit": 65000,
      "margin": 43.3,
      "itemCount": 450
    }
  ],
  "pnlChartData": [
    { "date": "2024-01", "value": 45000 },
    { "date": "2024-02", "value": 52000 }
  ],
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-06-30"
  }
}
```

---

## Security & Authorization

All report endpoints are protected by:

1. **AuthGuard:** Ensures user is authenticated
2. **RolesGuard:** Validates user role
3. **@Roles() Decorator:** Specifies allowed roles per endpoint
4. **CompanyId Isolation:** All queries filtered by user's company

### Role Permissions:

- **Financial:** OWNER, ADMIN, MANAGER
- **Inventory:** OWNER, ADMIN, MANAGER
- **Sales:** OWNER, ADMIN, MANAGER
- **Staff:** OWNER, ADMIN only (sensitive data)
- **Tax:** OWNER, ADMIN, MANAGER

---

## Testing

### Backend Testing:

```bash
# Test financial summary
curl -X POST http://localhost:5000/reports/financial-summary \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=..." \
  -d '{"startDate":"2024-01-01","endDate":"2024-12-31"}'
```

### Frontend Testing:

1. Navigate to `/reports`
2. Select date range (e.g., last 6 months)
3. Click "Apply Filter"
4. Verify all tabs load correctly
5. Test export functionality

---

## Future Enhancements

### Recommended Schema Updates:

#### 1. Product Expiry Tracking:

```prisma
model Product {
  // ... existing fields
  expiryDate DateTime?
}
```

#### 2. Sales Target Tracking:

```prisma
model User {
  // ... existing fields
  salesTarget Decimal? @db.Decimal(10, 2)
}
```

#### 3. Tax Paid Tracking:

```prisma
model PurchaseOrder {
  // ... existing fields
  tax Decimal? @db.Decimal(10, 2) @default(0)
}

model Expense {
  // ... existing fields
  tax Decimal? @db.Decimal(10, 2) @default(0)
}
```

### Feature Roadmap:

- [ ] PDF Export (using jsPDF)
- [ ] CSV Export (using papaparse)
- [ ] Email report scheduling
- [ ] Custom date presets (This Week, Last Month, etc.)
- [ ] Comparative analysis (vs previous period)
- [ ] Forecasting and predictions
- [ ] Drill-down reports (click category to see products)
- [ ] Report templates and saved views

---

## Troubleshooting

### Common Issues:

#### 1. "Company ID not found" Error

**Cause:** Missing CompanyId in request  
**Solution:** Ensure user is logged in and session contains companyId

#### 2. Empty Chart Data

**Cause:** No data in selected date range  
**Solution:** Verify date range contains actual transactions

#### 3. Slow Report Generation

**Cause:** Large date range with many transactions  
**Solution:**

- Add database indexes on date fields
- Consider pagination for very large datasets
- Implement caching for frequently accessed reports

#### 4. TypeScript Errors

**Cause:** Type mismatches in frontend  
**Solution:** Ensure reports.service.ts types match backend DTOs exactly

---

## Deployment Checklist

Before deploying to production:

- [ ] Run database migrations for any schema changes
- [ ] Verify all endpoints have proper RBAC decorators
- [ ] Test with production-like data volumes
- [ ] Configure API base URL in environment variables
- [ ] Enable request rate limiting on report endpoints
- [ ] Set up monitoring for slow queries
- [ ] Implement query result caching if needed
- [ ] Document any custom business logic
- [ ] Train users on report interpretation

---

## Support & Maintenance

### Key Files:

- Backend Service: `apps/server/src/reports/reports.service.ts`
- Backend Controller: `apps/server/src/reports/reports.controller.ts`
- Frontend Service: `apps/client/services/reports.service.ts`
- Frontend Page: `apps/client/app/(dashboard)/reports/page.tsx`

### Database Tables Used:

- Sale, SaleItem
- Product, ProductCategory
- Inventory, Warehouse
- Expense, ExpenseCategory
- PurchaseOrder, PurchaseOrderItem
- Customer, User
- StockAdjustment

### Performance Monitoring:

Monitor these queries for optimization:

1. Sale aggregations with large date ranges
2. SaleItem joins with Product for COGS
3. Inventory calculations across warehouses
4. Category revenue groupBy operations

---

## Conclusion

The Reports API is now fully functional and provides comprehensive business analytics across all major operational areas. The implementation follows best practices for:

✅ Security (RBAC, tenant isolation)  
✅ Performance (parallel queries, efficient aggregations)  
✅ Maintainability (clean architecture, TypeScript types)  
✅ User Experience (loading states, error handling, responsive design)

For questions or enhancements, refer to the codebase documentation or contact the development team.
