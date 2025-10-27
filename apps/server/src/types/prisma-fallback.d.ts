// Temporary fallback types for @prisma/client so TypeScript can compile
// This file helps when the generated Prisma client or its types are missing
// or when the environment blocks installing @prisma/client. Replace/remove
// when @prisma/client is properly installed and `npx prisma generate` runs.

declare module '@prisma/client' {
  // Minimal PrismaClient shim
  export class PrismaClient {
    constructor(options?: any);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $queryRaw: any;
    // Allow dynamic access to model delegates (e.g., prisma.user, prisma.product)
    [key: string]: any;
  }

  // Minimal enums used in the project. These provide runtime values so decorators
  // like @IsEnum(...) and default assignments work during type-checking.
  export enum ProductStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DISCONTINUED = 'DISCONTINUED',
  }

  export enum UserRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    STAFF = 'STAFF',
  }

  export enum OrderStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
  }

  export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
  }

  // Export anything else as `any` to be permissive for now
  export const Prisma: any;
}
