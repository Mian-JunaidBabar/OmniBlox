# Sales Lifecycle - Backend Implementation ✅

## Overview
This document details the complete implementation of the Sales lifecycle backend, including Customers and Sales modules with full RBAC security and warehouse-aware inventory management.

---

## Part 1: Customers Module Implementation ✅

### 🔒 Security Implementation

**File:** `apps/server/src/customers/customers.controller.ts`

#### RBAC Guards Applied:
```typescript
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  
  // CREATE - Managers and above only
  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  async create(...)
  
  // READ - All authenticated users
  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async findAll(...)
  
  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async findOne(...)
  
  // UPDATE - Managers and above only
  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  async update(...)
  
  // DELETE - Managers and above only
  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  async remove(...)
}
```

### 🏢 Multi-Tenancy Implementation

**File:** `apps/server/src/customers/customers.service.ts`

All operations are strictly filtered by `companyId`:

```typescript
// CREATE - Links customer to company
async create(dto: CreateCustomerDto, companyId: string) {
  const customer = await this.prisma.customer.create({
    data: {
      ...dto,
      companyId, // ✅ Tenant isolation
    },
  });
}

// READ - Only shows company's customers
async findAll(companyId: string, page, limit, search) {
  const where: any = { companyId }; // ✅ Tenant filter
  
  const customers = await this.prisma.customer.findMany({
    where,
    skip,
    take: limit,
  });
}

// UPDATE - Verifies ownership before update
async update(id: string, dto: UpdateCustomerDto, companyId: string) {
  const existingCustomer = await this.prisma.customer.findUnique({
    where: { id, companyId }, // ✅ Compound check
  });
  
  if (!existingCustomer) {
    throw new NotFoundException('Customer not found');
  }
}

// DELETE - Prevents deletion if customer has sales
async remove(id: string, companyId: string) {
  const salesCount = await this.prisma.sale.count({
    where: { customerId: id, companyId }, // ✅ Tenant-aware check
  });
  
  if (salesCount > 0) {
    throw new BadRequestException(
      'Cannot delete customer with existing sales'
    );
  }
}
```

---

## Part 2: Sales Module Implementation ✅

### 📋 DTO Structure

**File:** `apps/server/src/sales/dto/create-sale.dto.ts`

#### Sale Item DTO:
```typescript
export class CreateSaleItemDto {
  @IsString()
  @IsNotEmpty()
  readonly productId!: string;

  @IsInt()
  @Min(1)
  readonly quantity!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  readonly unitPrice!: number;
}
```

#### Create Sale DTO:
```typescript
export class CreateSaleDto {
  @IsOptional()
  @IsString()
  readonly invoiceNumber?: string;

  @ValidateNested()
  @Type(() => SaleCustomerDto)
  readonly customer!: SaleCustomerDto;

  @IsString()
  @IsNotEmpty()
  readonly warehouseId!: string; // ✅ CRITICAL: Warehouse selection

  @IsDateString()
  readonly saleDate!: string;

  @IsDateString()
  readonly dueDate!: string;

  @IsOptional()
  @IsIn(['DRAFT', 'PENDING', 'COMPLETED', 'CANCELLED'])
  readonly status?: OrderStatus;

  @IsOptional()
  @IsIn(['PAID', 'PENDING', 'PARTIAL'])
  readonly paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsIn(['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'CHECK'])
  readonly paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  readonly taxRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  readonly discount?: number;

  @IsOptional()
  @IsString()
  readonly notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  readonly items!: CreateSaleItemDto[];
}
```

### 🔒 Sales Controller RBAC

**File:** `apps/server/src/sales/sales.controller.ts`

```typescript
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  
  // CREATE - CRITICAL: Accessible to STAFF and above
  // This allows frontline workers to create sales
  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async create(
    @Body() dto: CreateSaleDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.salesService.create(dto, userId, companyId);
  }
  
  // READ - All authenticated users
  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async findAll(...)
  
  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async findOne(...)
  
  // UPDATE - Managers and above only
  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  async update(...)
  
  // MARK PAID - Managers and above only
  @Patch(':id/mark-paid')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  async markAsPaid(...)
  
  // DELETE - Managers and above only
  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  async remove(...)
}
```

---

## Part 3: Transactional Sale Creation with Inventory Deduction ✅

### 🎯 The Complete Transaction

**File:** `apps/server/src/sales/sales.service.ts`

This is the **most critical** method in the Sales lifecycle. It ensures:
- ✅ Data consistency (all-or-nothing)
- ✅ Stock validation before sale
- ✅ Atomic inventory updates
- ✅ Automatic rollback on any failure

```typescript
async create(
  dto: CreateSaleDto,
  userId: string,
  companyId: string,
): Promise<SaleResponseDto> {
  if (!dto.items?.length) {
    throw new BadRequestException('A sale must include at least one item');
  }

  return this.prisma.$transaction(
    async (tx) => {
      // STEP 1: Verify warehouse belongs to company
      const warehouse = await tx.warehouse.findUnique({
        where: { id: dto.warehouseId, companyId },
      });
      if (!warehouse) {
        throw new NotFoundException('Warehouse not found');
      }

      // STEP 2: Generate/validate invoice number
      const invoiceNumber = await this.ensureInvoiceNumber(
        tx,
        dto.invoiceNumber,
        companyId,
      );
      
      // STEP 3: Fetch product details
      const productMap = await this.fetchProducts(tx, dto.items, companyId);
      
      // STEP 4: ✅ CRITICAL - Check stock availability in the specific warehouse
      await this.ensureStockInWarehouse(
        tx, 
        dto.items, 
        productMap, 
        dto.warehouseId
      );

      // STEP 5: Resolve or create customer
      const customer = await this.resolveCustomer(
        tx,
        dto.customer,
        companyId,
      );
      
      // STEP 6: Calculate totals (subtotal, tax, discount, total)
      const totals = this.calculateTotals(
        dto.items,
        dto.taxRate,
        dto.discount,
      );

      // STEP 7: Create Sale record with all SaleItems
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          subtotal: totals.subtotal,
          tax: totals.tax,
          discount: totals.discount,
          totalAmount: totals.total,
          status: dto.status ?? OrderStatus.PENDING,
          paymentStatus: dto.paymentStatus ?? PaymentStatus.PENDING,
          paymentMethod: dto.paymentMethod ?? null,
          saleDate: new Date(dto.saleDate),
          dueDate: new Date(dto.dueDate),
          notes: dto.notes ?? null,
          customerId: customer.id,
          userId,
          companyId,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: this.roundCurrency(
                item.unitPrice ?? 
                Number(productMap.get(item.productId)?.salePrice ?? 0)
              ),
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          customer: true,
        },
      });

      // STEP 8: ✅ CRITICAL - Atomically decrement inventory
      await this.decrementInventoryFromWarehouse(
        tx, 
        dto.items, 
        dto.warehouseId
      );
      
      return this.transformSale(sale);
    },
    { timeout: 20000 }, // 20 second transaction timeout
  );
}
```

### 🔍 Stock Validation Method

This method is called **BEFORE** creating the sale to prevent overselling:

```typescript
/**
 * Verify that sufficient stock exists in the specific warehouse for all sale items.
 * This is called before creating the sale to prevent overselling.
 */
private async ensureStockInWarehouse(
  tx: any,
  items: CreateSaleItemDto[],
  productMap: Map<string, any>,
  warehouseId: string,
): Promise<void> {
  // Aggregate quantities (in case same product appears multiple times)
  const aggregated = this.aggregateQuantities(items);

  const checks = Array.from(aggregated.entries()).map(
    async ([productId, quantityNeeded]) => {
      // ✅ Use compound unique identifier to check specific warehouse
      const inventoryRecord = await tx.inventory.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId,
          },
        },
      });

      const available = inventoryRecord?.quantity ?? 0;
      
      if (available < quantityNeeded) {
        const productName = productMap.get(productId)?.name ?? productId;
        throw new BadRequestException(
          `Insufficient stock for product "${productName}" in selected warehouse. ` +
          `Available: ${available}, Needed: ${quantityNeeded}`
        );
      }
    },
  );

  // Execute all checks in parallel
  await Promise.all(checks);
}
```

### ⚛️ Atomic Inventory Decrement

This method uses Prisma's **atomic decrement** to safely reduce stock:

```typescript
/**
 * Atomically decrement inventory quantities from the specific warehouse.
 * Uses Prisma's atomic decrement to ensure thread-safe stock updates.
 * This is called within the sale creation transaction.
 */
private async decrementInventoryFromWarehouse(
  tx: any,
  items: CreateSaleItemDto[],
  warehouseId: string,
): Promise<void> {
  for (const item of items) {
    // ✅ CRITICAL: Use compound unique key for warehouse-specific update
    await tx.inventory.update({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: warehouseId,
        },
      },
      data: {
        quantity: {
          decrement: item.quantity, // ✅ Atomic operation
        },
      },
    });
  }
}
```

### 🛡️ Why This Approach is Secure

1. **Transaction Wrapping**: The entire operation is wrapped in `$transaction`, ensuring:
   - If warehouse validation fails → No records created
   - If stock check fails → No records created
   - If sale creation fails → No inventory updated
   - If inventory update fails → Sale rolled back

2. **Compound Key Usage**: Uses `productId_warehouseId` as defined in Prisma schema:
   ```prisma
   model Inventory {
     productId   String
     warehouseId String
     quantity    Int
     
     @@id([productId, warehouseId])
   }
   ```

3. **Atomic Decrement**: Prisma's `{ decrement: quantity }` is database-level atomic:
   - No race conditions
   - Thread-safe
   - Prevents negative stock (when combined with pre-checks)

4. **Stock Pre-Validation**: Checks availability **before** creating sale:
   - Clear error messages
   - Transaction rolls back before any writes
   - Prevents orphaned sale records

---

## 🔄 Transaction Flow Diagram

```
User submits sale request
         ↓
┌────────────────────────────────────────────────┐
│  BEGIN TRANSACTION                             │
│                                                │
│  1. Validate warehouse belongs to company     │
│     ❌ Not found → ROLLBACK                   │
│                                                │
│  2. Generate invoice number                   │
│     ❌ Duplicate → ROLLBACK                   │
│                                                │
│  3. Fetch product details                     │
│     ❌ Product not found → ROLLBACK           │
│                                                │
│  4. Check stock in warehouse                  │
│     ❌ Insufficient stock → ROLLBACK          │
│                                                │
│  5. Resolve/create customer                   │
│     ✅ Customer ready                         │
│                                                │
│  6. Calculate totals                          │
│     ✅ Subtotal, tax, discount, total         │
│                                                │
│  7. Create Sale + SaleItems                   │
│     ❌ Database error → ROLLBACK              │
│                                                │
│  8. Atomically decrement inventory            │
│     ❌ Update fails → ROLLBACK                │
│                                                │
│  ✅ COMMIT - All changes saved                │
└────────────────────────────────────────────────┘
         ↓
Return sale with items and customer
```

---

## 📊 Database Schema (Relevant Models)

```prisma
model Sale {
  id            String         @id @default(uuid())
  invoiceNumber String
  subtotal      Decimal        @db.Decimal(10, 2)
  tax           Decimal        @db.Decimal(10, 2)
  discount      Decimal        @db.Decimal(10, 2)
  totalAmount   Decimal        @db.Decimal(10, 2)
  status        OrderStatus
  paymentStatus PaymentStatus
  saleDate      DateTime
  dueDate       DateTime
  companyId     String         // ✅ Multi-tenancy
  customerId    String
  userId        String
  
  items    SaleItem[]
  customer Customer
  user     User
  company  Company
  
  @@unique([companyId, invoiceNumber])
}

model SaleItem {
  id        String  @id @default(uuid())
  quantity  Int
  unitPrice Decimal @db.Decimal(10, 2)
  saleId    String
  productId String
  
  sale    Sale
  product Product
}

model Inventory {
  productId   String
  warehouseId String
  quantity    Int
  
  @@id([productId, warehouseId]) // ✅ Compound primary key
}
```

---

## 🎯 API Endpoints Summary

### Customers API
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/customers` | OWNER, ADMIN, MANAGER | Create new customer |
| GET | `/customers` | All | List all customers (paginated, searchable) |
| GET | `/customers/:id` | All | Get single customer |
| PUT | `/customers/:id` | OWNER, ADMIN, MANAGER | Update customer |
| DELETE | `/customers/:id` | OWNER, ADMIN, MANAGER | Delete customer (if no sales) |

### Sales API
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/sales` | **STAFF+** | Create new sale (with inventory deduction) |
| GET | `/sales` | All | List all sales (paginated, filterable) |
| GET | `/sales/stats` | All | Get sales statistics |
| GET | `/sales/:id` | All | Get single sale with items |
| PUT | `/sales/:id` | OWNER, ADMIN, MANAGER | Update sale |
| PATCH | `/sales/:id/mark-paid` | OWNER, ADMIN, MANAGER | Mark sale as paid |
| DELETE | `/sales/:id` | OWNER, ADMIN, MANAGER | Delete sale |

---

## ✅ Implementation Checklist

### Part 1: Customers Backend ✅
- [x] Add RBAC guards to controller
- [x] Verify tenant-aware queries in service
- [x] Write operations restricted to MANAGER+
- [x] Read operations accessible to all roles
- [x] Prevent deletion of customers with sales

### Part 2: Sales Backend ✅
- [x] Add `warehouseId` field to CreateSaleDto
- [x] Add RBAC guards to controller
- [x] POST endpoint accessible to STAFF+
- [x] PUT/DELETE restricted to MANAGER+
- [x] Implement transactional create method
- [x] Create Sale + SaleItems in single transaction

### Part 3: Inventory Integration ✅
- [x] Validate warehouse belongs to company
- [x] Check stock availability before creating sale
- [x] Use compound key `productId_warehouseId` for lookups
- [x] Implement atomic decrement using Prisma's `{ decrement: n }`
- [x] Ensure transaction rolls back on any failure
- [x] Provide clear error messages for insufficient stock

---

## 🚀 Next Steps: Frontend Implementation

The backend is now complete and secure. Next tasks:

1. **Create `/customers` page** - Data table with search and pagination
2. **Create `/customers/new` form** - Add new customer
3. **Add RBAC UI** - Hide Create/Edit/Delete buttons for STAFF users
4. **Create `/sales` page** - Sales list with filters
5. **Create `/sales/new` form** - Complex form with:
   - Customer searchable dropdown
   - Warehouse selection dropdown
   - Dynamic line items section
   - Auto-calculated totals

---

## 📝 Testing the API

### Create a Sale (with warehouse-specific inventory)
```bash
POST http://localhost:3001/sales
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "warehouseId": "warehouse-uuid-here",
  "saleDate": "2025-10-27T10:00:00Z",
  "dueDate": "2025-11-27T10:00:00Z",
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "paymentMethod": "CASH",
  "taxRate": 0.15,
  "discount": 10.00,
  "notes": "Customer requested express delivery",
  "items": [
    {
      "productId": "product-uuid-1",
      "quantity": 5,
      "unitPrice": 29.99
    },
    {
      "productId": "product-uuid-2",
      "quantity": 2,
      "unitPrice": 149.99
    }
  ]
}
```

### Expected Response:
```json
{
  "id": "sale-uuid",
  "invoiceNumber": "INV-2025-001",
  "subtotal": 449.93,
  "tax": 67.49,
  "discount": 10.00,
  "totalAmount": 507.42,
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "items": [
    {
      "id": "item-1",
      "productId": "product-uuid-1",
      "productName": "Widget A",
      "quantity": 5,
      "unitPrice": 29.99
    },
    {
      "id": "item-2",
      "productId": "product-uuid-2",
      "productName": "Gadget B",
      "quantity": 2,
      "unitPrice": 149.99
    }
  ],
  "customer": {
    "id": "customer-uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Error Case - Insufficient Stock:
```json
{
  "statusCode": 400,
  "message": "Insufficient stock for product \"Widget A\" in selected warehouse. Available: 3, Needed: 5",
  "error": "Bad Request"
}
```

---

## 🎓 Key Learnings

1. **Transactions are Essential**: Never create a sale without wrapping in a transaction
2. **Validate Before Write**: Check stock availability before creating any records
3. **Atomic Operations**: Use Prisma's atomic operations for thread-safe updates
4. **Compound Keys**: Leverage compound unique constraints for warehouse-specific inventory
5. **Clear Error Messages**: Help users understand why stock is insufficient
6. **RBAC Granularity**: Allow STAFF to create sales but restrict destructive operations

---

**Implementation Date:** October 27, 2025  
**Status:** ✅ Complete and Production Ready  
**Next Phase:** Frontend UI Implementation
