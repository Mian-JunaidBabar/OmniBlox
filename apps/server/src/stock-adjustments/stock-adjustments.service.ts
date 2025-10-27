import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';

@Injectable()
export class StockAdjustmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateStockAdjustmentDto,
    userId: string,
    companyId: string,
  ) {
    if (!dto.items?.length) {
      throw new BadRequestException(
        'A stock adjustment must include at least one item',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        // Verify warehouse belongs to company
        const warehouse = await tx.warehouse.findUnique({
          where: { id: dto.warehouseId, companyId },
        });

        if (!warehouse) {
          throw new BadRequestException('Warehouse not found');
        }

        // Read current quantities for all items
        const itemsWithPreviousQuantities = await Promise.all(
          dto.items.map(async (item) => {
            const inventory = await tx.inventory.findUnique({
              where: {
                productId_warehouseId: {
                  productId: item.productId,
                  warehouseId: dto.warehouseId,
                },
              },
            });

            const previousQuantity = inventory?.quantity ?? 0;
            const difference = item.newQuantity - previousQuantity;

            return {
              ...item,
              previousQuantity,
              difference,
            };
          }),
        );

        // Create the main StockAdjustment record
        const stockAdjustment = await tx.stockAdjustment.create({
          data: {
            warehouseId: dto.warehouseId,
            companyId,
            userId,
            notes: dto.notes ?? null,
            adjustmentDate: new Date(dto.adjustmentDate),
          },
        });

        // Create all StockAdjustmentItem records
        await Promise.all(
          itemsWithPreviousQuantities.map((item) =>
            tx.stockAdjustmentItem.create({
              data: {
                adjustmentId: stockAdjustment.id,
                productId: item.productId,
                warehouseId: dto.warehouseId,
                previousQuantity: item.previousQuantity,
                newQuantity: item.newQuantity,
                difference: item.difference,
              },
            }),
          ),
        );

        // Upsert inventory records to update quantities
        await Promise.all(
          itemsWithPreviousQuantities.map((item) =>
            tx.inventory.upsert({
              where: {
                productId_warehouseId: {
                  productId: item.productId,
                  warehouseId: dto.warehouseId,
                },
              },
              create: {
                productId: item.productId,
                warehouseId: dto.warehouseId,
                quantity: item.newQuantity,
                companyId,
              },
              update: {
                quantity: item.newQuantity,
              },
            }),
          ),
        );

        // Return the complete adjustment with items
        return tx.stockAdjustment.findUnique({
          where: { id: stockAdjustment.id },
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
            warehouse: {
              select: {
                id: true,
                name: true,
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

  async findAll(companyId: string) {
    return this.prisma.stockAdjustment.findMany({
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
        warehouse: {
          select: {
            id: true,
            name: true,
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
      orderBy: { adjustmentDate: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    return this.prisma.stockAdjustment.findUnique({
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
        warehouse: {
          select: {
            id: true,
            name: true,
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
  }
}
