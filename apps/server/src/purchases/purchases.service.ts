import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePurchaseOrderDto, userId: string, companyId: string) {
    if (!dto.items?.length) {
      throw new BadRequestException(
        'A purchase order must include at least one item',
      );
    }

    // Verify supplier belongs to company
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId, companyId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Generate reference number if not provided
    const referenceNumber =
      dto.referenceNumber ||
      `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate totals
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0,
    );

    // Create the purchase order with items
    const purchaseOrder = await this.prisma.purchaseOrder.create({
      data: {
        referenceNumber,
        orderDate: new Date(dto.orderDate),
        status: dto.status || OrderStatus.PENDING,
        totalAmount,
        supplierId: dto.supplierId,
        userId,
        companyId,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return purchaseOrder;
  }

  async findAll(companyId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { companyId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { orderDate: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id, companyId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    return purchaseOrder;
  }

  async receive(id: string, warehouseId: string, companyId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        // 1. Verify the warehouse belongs to this company
        const warehouse = await tx.warehouse.findUnique({
          where: { id: warehouseId, companyId },
        });

        if (!warehouse) {
          throw new NotFoundException('Warehouse not found');
        }

        // 2. Verify the purchase order exists and belongs to this company
        const purchaseOrder = await tx.purchaseOrder.findUnique({
          where: { id, companyId },
          include: {
            items: true,
          },
        });

        if (!purchaseOrder) {
          throw new NotFoundException('Purchase order not found');
        }

        if (purchaseOrder.status === OrderStatus.COMPLETED) {
          throw new BadRequestException(
            'This purchase order has already been received',
          );
        }

        // 2. Update the purchase order status to COMPLETED
        await tx.purchaseOrder.update({
          where: { id },
          data: {
            status: OrderStatus.COMPLETED,
          },
        });

        // 3. Update inventory for each item using atomic increment
        await Promise.all(
          purchaseOrder.items.map((item) =>
            tx.inventory.upsert({
              where: {
                productId_warehouseId: {
                  productId: item.productId,
                  warehouseId: warehouseId,
                },
              },
              create: {
                productId: item.productId,
                warehouseId: warehouseId,
                quantity: item.quantity,
              },
              update: {
                quantity: {
                  increment: item.quantity,
                },
              },
            }),
          ),
        );

        // 4. Return the updated purchase order
        return tx.purchaseOrder.findUnique({
          where: { id },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                  },
                },
              },
            },
            supplier: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        });
      },
      { timeout: 20000 },
    );
  }
}
