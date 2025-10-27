# RBAC Quick Reference Guide

## Import Statements

```typescript
import { UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { CompanyId } from '@/auth/decorators/company-id.decorator';
import { GetCurrentUser } from '@/auth/decorators/current-user.decorator';
```

---

## Permission Patterns

### ✅ OWNER ONLY
**Use Case**: Critical operations (company deletion, billing)

```typescript
@Delete('company')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
deleteCompany(@CompanyId() companyId: string) {
  // Only OWNER can execute
}
```

### ✅ OWNER & ADMIN
**Use Case**: User management, company settings

```typescript
@Post('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
createUser(
  @Body() dto: CreateUserDto,
  @CompanyId() companyId: string
) {
  // OWNER or ADMIN can execute
}
```

### ✅ OWNER, ADMIN, MANAGER
**Use Case**: Business data CRUD (products, customers, sales, etc.)

```typescript
@Post('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
createProduct(
  @Body() dto: CreateProductDto,
  @CompanyId() companyId: string
) {
  // Higher-level roles can create
}

@Put('products/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
updateProduct(
  @Param('id') id: string,
  @Body() dto: UpdateProductDto
) {
  // Higher-level roles can update
}

@Delete('products/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
deleteProduct(@Param('id') id: string) {
  // Higher-level roles can delete
}
```

### ✅ ALL ROLES (Read Access)
**Use Case**: Reading business data

```typescript
@Get('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
listProducts(@CompanyId() companyId: string) {
  // All roles can read
}
```

### ✅ ALL ROLES (Specific Creates)
**Use Case**: Operations STAFF can perform (sales, expenses)

```typescript
@Post('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
createSale(
  @Body() dto: CreateSaleDto,
  @CompanyId() companyId: string,
  @GetCurrentUser('id') userId: string
) {
  // All roles can create sales
}
```

### ✅ NO ROLES SPECIFIED
**Use Case**: All authenticated users (profile, general info)

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard) // Only JwtAuthGuard needed
getProfile(@GetCurrentUser() user: any) {
  // Any authenticated user can access
}
```

---

## Decorator Usage

### Extract Company ID

```typescript
@CompanyId() companyId: string
```

### Extract User Information

```typescript
// Entire user object
@GetCurrentUser() user: any

// Specific field
@GetCurrentUser('id') userId: string
@GetCurrentUser('email') email: string
@GetCurrentUser('role') role: UserRole
```

---

## Controller-Level Guards

Apply guards to all routes in a controller:

```typescript
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard) // Applied to all methods
export class ProductsController {
  
  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findAll(@CompanyId() companyId: string) {
    // All roles can read
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  create(
    @Body() dto: CreateProductDto,
    @CompanyId() companyId: string
  ) {
    // Only higher roles can create
  }

  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto
  ) {
    // Only higher roles can update
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  delete(@Param('id') id: string) {
    // Only higher roles can delete
  }
}
```

---

## Permission Matrix

| Role | User Management | Company Settings | Business CRUD | Specific Creates | Read Access | Company Deletion |
|------|----------------|------------------|---------------|-----------------|-------------|------------------|
| **OWNER** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **MANAGER** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| **STAFF** | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |

---

## Common Patterns

### Pattern 1: Standard CRUD Resource

```typescript
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  
  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findAll(@CompanyId() companyId: string) { }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: any, @CompanyId() companyId: string) { }

  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: any) { }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  delete(@Param('id') id: string) { }
}
```

### Pattern 2: Administrative Resource

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  
  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  findAll(@CompanyId() companyId: string) { }

  @Post('invite')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  invite(@Body() dto: any, @CompanyId() companyId: string) { }

  @Put(':id/role')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  updateRole(@Param('id') id: string, @Body() dto: any) { }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  remove(@Param('id') id: string) { }
}
```

### Pattern 3: Transactional Resource (STAFF Can Create)

```typescript
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  
  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findAll(@CompanyId() companyId: string) { }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  create(
    @Body() dto: any,
    @CompanyId() companyId: string,
    @GetCurrentUser('id') userId: string
  ) { }

  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: any) { }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  delete(@Param('id') id: string) { }
}
```
