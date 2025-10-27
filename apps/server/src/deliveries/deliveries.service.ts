import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryResponseDto } from './dto/delivery-response.dto';
import { DispatchDeliveryDto } from './dto/dispatch-delivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string): Promise<DeliveryResponseDto[]> {
    const deliveries = await this.prisma.delivery.findMany({
      where: { companyId },
      include: {
        sale: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return deliveries.map((delivery) => this.transformDelivery(delivery));
  }

  async dispatch(
    id: string,
    companyId: string,
    dto: DispatchDeliveryDto,
  ): Promise<DeliveryResponseDto> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id, companyId },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const updated = await this.prisma.delivery.update({
      where: { id },
      data: {
        status: 'IN_TRANSIT',
        dispatchDate: new Date(),
        trackingNumber: dto.trackingNumber ?? null,
      },
      include: {
        sale: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
          },
        },
      },
    });

    return this.transformDelivery(updated);
  }

  async complete(id: string, companyId: string): Promise<DeliveryResponseDto> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id, companyId },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const updated = await this.prisma.delivery.update({
      where: { id },
      data: {
        status: 'DELIVERED',
        deliveredDate: new Date(),
      },
      include: {
        sale: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
          },
        },
      },
    });

    return this.transformDelivery(updated);
  }

  private transformDelivery(delivery: any): DeliveryResponseDto {
    return {
      id: delivery.id,
      status: delivery.status,
      trackingNumber: delivery.trackingNumber,
      deliveryAddress: delivery.deliveryAddress,
      dispatchDate: delivery.dispatchDate?.toISOString() ?? null,
      deliveredDate: delivery.deliveredDate?.toISOString() ?? null,
      createdAt: delivery.createdAt.toISOString(),
      updatedAt: delivery.updatedAt.toISOString(),
      sale: {
        id: delivery.sale.id,
        invoiceNumber: delivery.sale.invoiceNumber,
        totalAmount: delivery.sale.totalAmount.toString(),
        saleDate: delivery.sale.saleDate.toISOString(),
        customer: {
          id: delivery.sale.customer.id,
          name: delivery.sale.customer.name,
          email: delivery.sale.customer.email,
        },
        items: delivery.sale.items.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          product: {
            id: item.product.id,
            name: item.product.name,
            sku: item.product.sku,
          },
        })),
      },
    };
  }
}
