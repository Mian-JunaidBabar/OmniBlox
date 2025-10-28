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

    // Verify warehouse belongs to company
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId, companyId },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    // Generate reference number if not provided
    const referenceNumber =
      dto.referenceNumber ||
      `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate totals
    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0,
    );
    const totalAmount = subtotal; // Can add tax/discount later if needed

    // Create the purchase order with items
    const purchaseOrder = await this.prisma.purchaseOrder.create({
      data: {
        referenceNumber,
        orderDate: new Date(dto.orderDate),
        status: dto.status || OrderStatus.PENDING,
        subtotal,
        totalAmount,
        notes: dto.notes || null,
        supplierId: dto.supplierId,
        warehouseId: dto.warehouseId,
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
        warehouse: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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
        warehouse: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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
        warehouse: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    return purchaseOrder;
  }

  async receive(id: string, companyId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        // 1. Verify the purchase order exists and belongs to this company
        const purchaseOrder = await tx.purchaseOrder.findUnique({
          where: { id, companyId },
          include: {
            items: true,
          },
        });

        if (!purchaseOrder) {
          throw new NotFoundException('Purchase order not found');
        }

        if (purchaseOrder.status === OrderStatus.RECEIVED) {
          throw new BadRequestException(
            'This purchase order has already been received',
          );
        }

        // 2. Update the purchase order status to RECEIVED
        await tx.purchaseOrder.update({
          where: { id },
          data: {
            status: OrderStatus.RECEIVED,
          },
        });

        // 3. Update inventory for each item using atomic increment
        await Promise.all(
          purchaseOrder.items.map((item) =>
            tx.inventory.upsert({
              where: {
                productId_warehouseId: {
                  productId: item.productId,
                  warehouseId: purchaseOrder.warehouseId,
                },
              },
              create: {
                productId: item.productId,
                warehouseId: purchaseOrder.warehouseId,
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
            warehouse: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });
      },
      { timeout: 20000 },
    );
  }
}
