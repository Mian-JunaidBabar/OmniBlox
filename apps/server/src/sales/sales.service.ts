import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto, CreateSaleItemDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import {
  SaleItemResponseDto,
  SaleResponseDto,
  SaleSummaryDto,
  SalesListResponseDto,
  SalesStatsDto,
} from './dto/sale-response.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSaleDto, userId: string): Promise<SaleResponseDto> {
    if (!dto.items?.length) {
      throw new BadRequestException('A sale must include at least one item');
    }

    return this.prisma.$transaction(
      async (tx) => {
        const invoiceNumber = await this.ensureInvoiceNumber(
          tx,
          dto.invoiceNumber,
        );
        const productMap = await this.fetchProducts(tx, dto.items);
        await this.ensureStock(tx, dto.items, productMap);

        const customer = await this.resolveCustomer(tx, dto.customer);
        const providedEmail = dto.customer.email?.trim();
        const totals = this.calculateTotals(
          dto.items,
          dto.taxRate,
          dto.discount,
        );

        const sale = await tx.sale.create({
          data: {
            invoiceNumber,
            subtotal: totals.subtotal,
            tax: totals.tax,
            discount: totals.discount,
            totalAmount: totals.total,
            status: (dto.status ?? OrderStatus.PENDING) as OrderStatus,
            paymentStatus: (dto.paymentStatus ??
              PaymentStatus.PENDING) as PaymentStatus,
            paymentMethod: dto.paymentMethod ?? null,
            saleDate: new Date(dto.saleDate),
            dueDate: new Date(dto.dueDate),
            notes: dto.notes ?? null,
            customerId: customer.id,
            customerEmail: providedEmail ?? customer.email ?? null,
            userId,
            items: {
              create: dto.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: this.roundCurrency(
                  item.unitPrice ??
                    Number(productMap.get(item.productId)?.salePrice ?? 0),
                ),
              })),
            },
          },
          include: {
            items: { include: { product: true } },
            customer: true,
          },
        });

        await this.adjustInventory(tx, dto.items, 'decrement');
        return this.transformSale(sale);
      },
      { timeout: 20000 },
    );
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    status?: OrderStatus | string,
    paymentStatus?: PaymentStatus | string,
  ): Promise<SalesListResponseDto> {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status as OrderStatus;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { saleDate: 'desc' },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      sales: sales.map((sale) => this.transformSaleSummary(sale)),
      total,
      pages: limit === 0 ? 1 : Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: string): Promise<SaleResponseDto> {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return this.transformSale(sale);
  }

  async update(id: string, dto: UpdateSaleDto): Promise<SaleResponseDto> {
    return this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.sale.findUnique({
          where: { id },
          include: {
            customer: true,
            items: true,
          },
        });

        if (!existing) {
          throw new NotFoundException('Sale not found');
        }

        if (dto.invoiceNumber && dto.invoiceNumber !== existing.invoiceNumber) {
          const duplicate = await tx.sale.findUnique({
            where: { invoiceNumber: dto.invoiceNumber },
            select: { id: true },
          });
          if (duplicate) {
            throw new ConflictException('Invoice number already exists');
          }
        }

        const productMap = dto.items
          ? await this.fetchProducts(tx, dto.items)
          : null;
        if (dto.items) {
          await this.adjustInventory(
            tx,
            existing.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            'increment',
          );
          await this.ensureStock(tx, dto.items, productMap!);
        }

        const resolvedCustomer = dto.customer
          ? await this.resolveCustomer(tx, dto.customer)
          : null;
        const providedEmail =
          dto.customer?.email !== undefined
            ? (dto.customer.email?.trim() ?? null)
            : undefined;

        const targetCustomerId = resolvedCustomer?.id ?? existing.customerId;
        const targetCustomerEmail =
          providedEmail !== undefined
            ? providedEmail
            : (resolvedCustomer?.email ??
              existing.customerEmail ??
              existing.customer?.email ??
              null);

        const recalculationNeeded =
          !!dto.items ||
          dto.taxRate !== undefined ||
          dto.discount !== undefined;

        const sourceItems: CreateSaleItemDto[] = dto.items
          ? dto.items
          : existing.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: Number(item.unitPrice),
            }));

        const existingTotals = {
          subtotal: Number(existing.subtotal),
          tax: Number(existing.tax),
          discount: Number(existing.discount),
          total: Number(existing.totalAmount),
        };

        const targetTaxRate =
          dto.taxRate ??
          this.deriveTaxRate(existingTotals.subtotal, existingTotals.tax);
        const targetDiscount = dto.discount ?? existingTotals.discount;

        const totals = recalculationNeeded
          ? this.calculateTotals(sourceItems, targetTaxRate, targetDiscount)
          : existingTotals;

        const updated = await tx.sale.update({
          where: { id },
          data: {
            invoiceNumber: dto.invoiceNumber ?? existing.invoiceNumber,
            saleDate: dto.saleDate ? new Date(dto.saleDate) : existing.saleDate,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : existing.dueDate,
            status: (dto.status ?? existing.status) as OrderStatus,
            paymentStatus: (dto.paymentStatus ??
              existing.paymentStatus) as PaymentStatus,
            paymentMethod: dto.paymentMethod ?? existing.paymentMethod,
            notes: dto.notes !== undefined ? dto.notes : existing.notes,
            subtotal: totals.subtotal,
            tax: totals.tax,
            discount: totals.discount,
            totalAmount: totals.total,
            customer:
              targetCustomerId !== existing.customerId
                ? { connect: { id: targetCustomerId } }
                : undefined,
            customerEmail: targetCustomerEmail,
            items: dto.items
              ? {
                  deleteMany: {},
                  create: dto.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: this.roundCurrency(
                      item.unitPrice ??
                        Number(productMap?.get(item.productId)?.salePrice ?? 0),
                    ),
                  })),
                }
              : undefined,
          },
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        });

        if (dto.items) {
          await this.adjustInventory(tx, dto.items, 'decrement');
        }

        return this.transformSale(updated);
      },
      { timeout: 20000 },
    );
  }

  async remove(id: string): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const sale = await tx.sale.findUnique({
          where: { id },
          include: { items: true },
        });

        if (!sale) {
          throw new NotFoundException('Sale not found');
        }

        await this.adjustInventory(
          tx,
          sale.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          'increment',
        );

        await tx.sale.delete({ where: { id } });
      },
      { timeout: 20000 },
    );
  }

  async markAsPaid(id: string): Promise<SaleResponseDto> {
    const sale = await this.prisma.sale.update({
      where: { id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.COMPLETED,
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    return this.transformSale(sale);
  }

  async getStats(): Promise<SalesStatsDto> {
    const now = new Date();
    const [
      totalSales,
      paidAmount,
      pendingAmount,
      overdueAmount,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
    ] = await Promise.all([
      this.prisma.sale.count(),
      this.prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: PaymentStatus.PAID },
      }),
      this.prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: { not: PaymentStatus.PAID } },
      }),
      this.prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: {
          dueDate: { lt: now },
          paymentStatus: { not: PaymentStatus.PAID },
        },
      }),
      this.prisma.sale.count({ where: { paymentStatus: PaymentStatus.PAID } }),
      this.prisma.sale.count({
        where: { paymentStatus: PaymentStatus.PENDING },
      }),
      this.prisma.sale.count({
        where: {
          dueDate: { lt: now },
          paymentStatus: { not: PaymentStatus.PAID },
        },
      }),
    ]);

    return {
      totalSales,
      totalRevenue: this.decimalToNumber(paidAmount._sum.totalAmount),
      pendingAmount: this.decimalToNumber(pendingAmount._sum.totalAmount),
      overdueAmount: this.decimalToNumber(overdueAmount._sum.totalAmount),
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
    };
  }

  private async ensureInvoiceNumber(
    tx: any,
    invoiceNumber?: string,
  ): Promise<string> {
    if (invoiceNumber) {
      const existing = await tx.sale.findUnique({
        where: { invoiceNumber },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictException('Invoice number already exists');
      }
      return invoiceNumber;
    }

    const count = await tx.sale.count();
    const nextNumber = (count + 1).toString().padStart(5, '0');
    return `INV-${nextNumber}`;
  }

  private async fetchProducts(
    tx: any,
    items: CreateSaleItemDto[],
  ): Promise<Map<string, any>> {
    const uniqueProductIds = Array.from(
      new Set(items.map((item) => item.productId)),
    );
    const products = await tx.product.findMany({
      where: { id: { in: uniqueProductIds } },
    });

    if (products.length !== uniqueProductIds.length) {
      throw new BadRequestException('One or more products could not be found');
    }

    return new Map(products.map((product) => [product.id, product]));
  }

  private async ensureStock(
    tx: any,
    items: CreateSaleItemDto[],
    productMap: Map<string, any>,
  ): Promise<void> {
    const aggregated = this.aggregateQuantities(items);

    const checks = Array.from(aggregated.entries()).map(
      async ([productId, quantity]) => {
        const total = await tx.inventory.aggregate({
          _sum: { quantity: true },
          where: { productId },
        });
        const available = total._sum.quantity ?? 0;
        if (available < quantity) {
          const name = productMap.get(productId)?.name ?? productId;
          throw new BadRequestException(
            `Insufficient stock for product: ${name}`,
          );
        }
      },
    );

    await Promise.all(checks);
  }

  private aggregateQuantities(items: CreateSaleItemDto[]): Map<string, number> {
    const aggregated = new Map<string, number>();
    for (const item of items) {
      aggregated.set(
        item.productId,
        (aggregated.get(item.productId) ?? 0) + item.quantity,
      );
    }
    return aggregated;
  }

  private async resolveCustomer(
    tx: any,
    customer: CreateSaleDto['customer'],
  ): Promise<{ id: string; email: string | null }> {
    const normalized = {
      ...customer,
      name: customer.name.trim(),
      email: customer.email?.trim(),
      phone: customer.phone?.trim(),
      address: customer.address?.trim(),
    };

    if (customer.id) {
      const existing = await tx.customer.findUnique({
        where: { id: customer.id },
      });
      if (!existing) {
        throw new BadRequestException('Customer not found');
      }
      const updates = this.buildCustomerUpdates(normalized, existing);
      if (Object.keys(updates).length) {
        const updated = await tx.customer.update({
          where: { id: existing.id },
          data: updates,
        });
        return { id: updated.id, email: updated.email ?? null };
      }
      return { id: existing.id, email: existing.email ?? null };
    }

    if (normalized.email) {
      const existing = await tx.customer.findUnique({
        where: { email: normalized.email },
      });
      if (existing) {
        const updates = this.buildCustomerUpdates(normalized, existing);
        if (Object.keys(updates).length) {
          const updated = await tx.customer.update({
            where: { id: existing.id },
            data: updates,
          });
          return { id: updated.id, email: updated.email ?? null };
        }
        return { id: existing.id, email: existing.email ?? null };
      }
    }

    const byName = await tx.customer.findFirst({
      where: { name: normalized.name },
    });
    if (byName) {
      const updates = this.buildCustomerUpdates(normalized, byName);
      if (Object.keys(updates).length) {
        const updated = await tx.customer.update({
          where: { id: byName.id },
          data: updates,
        });
        return { id: updated.id, email: updated.email ?? null };
      }
      return { id: byName.id, email: byName.email ?? null };
    }

    const created = await tx.customer.create({
      data: {
        name: normalized.name,
        email: normalized.email,
        phone: normalized.phone,
        address: normalized.address,
      },
    });

    return { id: created.id, email: created.email ?? null };
  }

  private buildCustomerUpdates(
    customer: {
      name: string;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
    },
    existing: {
      name: string;
      email: string | null;
      phone: string | null;
      address: string | null;
    },
  ): Record<string, unknown> {
    const updates: Record<string, unknown> = {};

    if (customer.name && customer.name !== existing.name) {
      updates.name = customer.name;
    }

    if (customer.email !== undefined && customer.email !== existing.email) {
      updates.email = customer.email;
    }

    if (customer.phone && customer.phone !== existing.phone) {
      updates.phone = customer.phone;
    }

    if (customer.address && customer.address !== existing.address) {
      updates.address = customer.address;
    }

    return updates;
  }

  private calculateTotals(
    items: CreateSaleItemDto[],
    taxRate?: number,
    discountAmount?: number,
  ) {
    const subtotal = this.roundCurrency(
      items.reduce(
        (sum, item) => sum + item.quantity * (item.unitPrice ?? 0),
        0,
      ),
    );

    const tax = taxRate ? this.roundCurrency(subtotal * (taxRate / 100)) : 0;
    const discount = this.roundCurrency(discountAmount ?? 0);

    if (discount > subtotal + tax) {
      throw new BadRequestException('Discount cannot exceed the invoice total');
    }

    const total = this.roundCurrency(subtotal + tax - discount);

    return { subtotal, tax, discount, total };
  }

  private deriveTaxRate(subtotal: number, tax: number): number | undefined {
    if (!subtotal) {
      return undefined;
    }
    return (tax / subtotal) * 100;
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private decimalToNumber(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }
    return typeof value === 'number' ? value : Number(value);
  }

  private transformSaleItem(item: any): SaleItemResponseDto {
    const unitPrice = this.decimalToNumber(item.unitPrice);
    return {
      id: item.id,
      productId: item.productId,
      productName: item.product?.name ?? item.productId,
      quantity: item.quantity,
      unitPrice,
      total: this.roundCurrency(item.quantity * unitPrice),
    };
  }

  private transformSaleSummary(sale: any): SaleSummaryDto {
    const subtotal = this.decimalToNumber(sale.subtotal);
    const tax = this.decimalToNumber(sale.tax);
    const discount = this.decimalToNumber(sale.discount);
    const total = this.decimalToNumber(sale.totalAmount);
    const isPaid = sale.paymentStatus === PaymentStatus.PAID;
    const isOverdue = !isPaid && sale.dueDate < new Date();

    return {
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      customerId: sale.customerId,
      customerName: sale.customer?.name ?? 'Unknown Customer',
      customerEmail: sale.customerEmail ?? sale.customer?.email ?? null,
      saleDate: sale.saleDate.toISOString(),
      dueDate: sale.dueDate.toISOString(),
      status: sale.status,
      paymentStatus: sale.paymentStatus,
      paymentMethod: sale.paymentMethod ?? null,
      subtotal,
      tax,
      discount,
      totalAmount: total,
      balanceDue: isPaid ? 0 : total,
      isOverdue,
      createdAt: sale.createdAt.toISOString(),
      updatedAt: sale.updatedAt.toISOString(),
    };
  }

  private transformSale(sale: any): SaleResponseDto {
    return {
      ...this.transformSaleSummary(sale),
      notes: sale.notes,
      items: sale.items.map((item) => this.transformSaleItem(item)),
    };
  }

  private async adjustInventory(
    tx: any,
    items: { productId: string; quantity: number }[],
    direction: 'increment' | 'decrement',
  ): Promise<void> {
    for (const item of items) {
      if (direction === 'decrement') {
        await this.decrementInventory(tx, item.productId, item.quantity);
      } else {
        await this.incrementInventory(tx, item.productId, item.quantity);
      }
    }
  }

  private async decrementInventory(
    tx: any,
    productId: string,
    quantity: number,
  ) {
    if (quantity <= 0) {
      return;
    }

    const inventoryRecords = await tx.inventory.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });

    if (!inventoryRecords.length) {
      throw new BadRequestException(
        'No inventory found for the requested product',
      );
    }

    let remaining = quantity;

    for (const record of inventoryRecords) {
      if (remaining <= 0) {
        break;
      }

      if (record.quantity <= 0) {
        continue;
      }

      const deduction = Math.min(record.quantity, remaining);
      await tx.inventory.update({
        where: {
          productId_warehouseId: {
            productId: record.productId,
            warehouseId: record.warehouseId,
          },
        },
        data: {
          quantity: { decrement: deduction },
        },
      });
      remaining -= deduction;
    }

    if (remaining > 0) {
      throw new BadRequestException('Insufficient stock to complete this sale');
    }
  }

  private async incrementInventory(
    tx: any,
    productId: string,
    quantity: number,
  ) {
    if (quantity <= 0) {
      return;
    }

    const existing = await tx.inventory.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });

    if (existing.length) {
      const target = existing[0];
      await tx.inventory.update({
        where: {
          productId_warehouseId: {
            productId: target.productId,
            warehouseId: target.warehouseId,
          },
        },
        data: {
          quantity: { increment: quantity },
        },
      });
      return;
    }

    const warehouse =
      (await tx.warehouse.findFirst({ orderBy: { createdAt: 'asc' } })) ??
      (await tx.warehouse.create({
        data: {
          name: 'Default Warehouse',
          location: 'Default Location',
        },
      }));

    await tx.inventory.create({
      data: {
        productId,
        warehouseId: warehouse.id,
        quantity,
      },
    });
  }
}
