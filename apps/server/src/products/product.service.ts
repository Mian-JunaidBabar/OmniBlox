import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const { sku, category, brand, stock, ...productData } = createProductDto;

    // Check if SKU already exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists');
    }

    try {
      // Find or create category
      let categoryRecord = await this.prisma.productCategory.findUnique({
        where: { name: category },
      });

      if (!categoryRecord) {
        categoryRecord = await this.prisma.productCategory.create({
          data: { name: category },
        });
      }

      // Find or create brand if provided
      let brandRecord: { id: string; name: string } | null = null;
      if (brand) {
        brandRecord = await this.prisma.brand.findUnique({
          where: { name: brand },
        });

        if (!brandRecord) {
          brandRecord = await this.prisma.brand.create({
            data: { name: brand },
          });
        }
      }

      // Create product
      const product = await this.prisma.product.create({
        data: {
          sku,
          ...productData,
          categoryId: categoryRecord.id,
          brandId: brandRecord?.id || null,
        },
        include: {
          category: true,
          brand: true,
        },
      });

      // Create inventory entry (assume default warehouse for now)
      // TODO: Handle multiple warehouses
      const defaultWarehouse = await this.prisma.warehouse.findFirst();
      if (!defaultWarehouse) {
        // Create a default warehouse if none exists
        const warehouse = await this.prisma.warehouse.create({
          data: {
            name: 'Default Warehouse',
            location: 'Default Location',
          },
        });

        await this.prisma.inventory.create({
          data: {
            productId: product.id,
            warehouseId: warehouse.id,
            quantity: stock,
          },
        });
      } else {
        await this.prisma.inventory.create({
          data: {
            productId: product.id,
            warehouseId: defaultWarehouse.id,
            quantity: stock,
          },
        });
      }

      return this.transformToDto(product, stock);
    } catch (error) {
      throw new BadRequestException('Failed to create product');
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    status?: string,
  ): Promise<{ products: ProductResponseDto[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = {
        name: category,
      };
    }

    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          brand: true,
          inventory: {
            include: {
              warehouse: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products: products.map((product) => {
        const totalStock = product.inventory.reduce(
          (sum, inv) => sum + inv.quantity,
          0,
        );
        return this.transformToDto(product, totalStock);
      }),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const totalStock = product.inventory.reduce(
      (sum, inv) => sum + inv.quantity,
      0,
    );
    return this.transformToDto(product, totalStock);
  }

  async findBySku(sku: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        brand: true,
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const totalStock = product.inventory.reduce(
      (sum, inv) => sum + inv.quantity,
      0,
    );
    return this.transformToDto(product, totalStock);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        inventory: true,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    // Check if SKU is being updated and if it conflicts with existing product
    if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
      const existingSkuProduct = await this.prisma.product.findUnique({
        where: { sku: updateProductDto.sku },
      });

      if (existingSkuProduct) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    try {
      const { category, brand, stock, ...productData } = updateProductDto;
      const updateData: any = { ...productData };

      // Handle category update
      if (category !== undefined) {
        let categoryRecord = await this.prisma.productCategory.findUnique({
          where: { name: category },
        });

        if (!categoryRecord) {
          categoryRecord = await this.prisma.productCategory.create({
            data: { name: category },
          });
        }
        updateData.categoryId = categoryRecord.id;
      }

      // Handle brand update
      if (brand !== undefined) {
        if (brand === null || brand === '') {
          updateData.brandId = null;
        } else {
          let brandRecord = await this.prisma.brand.findUnique({
            where: { name: brand },
          });

          if (!brandRecord) {
            brandRecord = await this.prisma.brand.create({
              data: { name: brand },
            });
          }
          updateData.brandId = brandRecord.id;
        }
      }

      const product = await this.prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          brand: true,
          inventory: {
            include: {
              warehouse: true,
            },
          },
        },
      });

      // Handle stock update if provided
      if (stock !== undefined) {
        // For now, update the first inventory entry (default warehouse)
        // TODO: Handle multiple warehouses properly
        const defaultWarehouse = await this.prisma.warehouse.findFirst();
        if (defaultWarehouse) {
          await this.prisma.inventory.upsert({
            where: {
              productId_warehouseId: {
                productId: product.id,
                warehouseId: defaultWarehouse.id,
              },
            },
            update: {
              quantity: stock,
            },
            create: {
              productId: product.id,
              warehouseId: defaultWarehouse.id,
              quantity: stock,
            },
          });
        }
      }

      const totalStock = product.inventory.reduce(
        (sum, inv) => sum + inv.quantity,
        0,
      );
      return this.transformToDto(product, totalStock);
    } catch (error) {
      throw new BadRequestException('Failed to update product');
    }
  }

  async remove(id: string): Promise<void> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    try {
      await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to delete product. It may be referenced by other records.',
      );
    }
  }

  async updateStock(
    id: string,
    quantity: number,
    operation: 'add' | 'subtract',
  ): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // For now, work with the first inventory entry (default warehouse)
    // TODO: Handle multiple warehouses properly
    const defaultWarehouse = await this.prisma.warehouse.findFirst();
    if (!defaultWarehouse) {
      throw new BadRequestException('No warehouse configured');
    }

    const existingInventory = product.inventory.find(
      (inv) => inv.warehouseId === defaultWarehouse.id,
    );
    const currentStock = existingInventory?.quantity || 0;
    const newStock =
      operation === 'add' ? currentStock + quantity : currentStock - quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    // Upsert inventory
    await this.prisma.inventory.upsert({
      where: {
        productId_warehouseId: {
          productId: product.id,
          warehouseId: defaultWarehouse.id,
        },
      },
      update: {
        quantity: newStock,
      },
      create: {
        productId: product.id,
        warehouseId: defaultWarehouse.id,
        quantity: newStock,
      },
    });

    // Return updated product
    const updatedProduct = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!updatedProduct) {
      throw new NotFoundException('Product not found after update');
    }

    const totalStock = updatedProduct.inventory.reduce(
      (sum, inv) => sum + inv.quantity,
      0,
    );
    return this.transformToDto(updatedProduct, totalStock);
  }

  async getLowStockProducts(): Promise<ProductResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        category: true,
        brand: true,
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    // Filter products where total stock is less than or equal to reorder level
    const lowStockProducts = products.filter((product) => {
      const totalStock = product.inventory.reduce(
        (sum, inv) => sum + inv.quantity,
        0,
      );
      return totalStock <= product.reorderLevel;
    });

    return lowStockProducts.map((product) => {
      const totalStock = product.inventory.reduce(
        (sum, inv) => sum + inv.quantity,
        0,
      );
      return this.transformToDto(product, totalStock);
    });
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.prisma.productCategory.findMany({
      select: { name: true },
    });

    return categories.map((category) => category.name);
  }

  async getBrands(): Promise<string[]> {
    const brands = await this.prisma.brand.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });

    return brands.map((brand) => brand.name);
  }

  async getStats() {
    const products = await this.prisma.product.findMany({
      include: {
        inventory: true,
      },
    });

    const totalProducts = products.length;
    const { lowStockCount, totalValue } = products.reduce(
      (acc, product) => {
        const totalStock = product.inventory.reduce(
          (sum, inv) => sum + inv.quantity,
          0,
        );

        if (totalStock <= product.reorderLevel) {
          acc.lowStockCount += 1;
        }

        acc.totalValue += Number(product.salePrice) * totalStock;
        return acc;
      },
      { lowStockCount: 0, totalValue: 0 },
    );

    const categoriesCount = await this.prisma.productCategory.count();

    return {
      totalProducts,
      lowStockCount,
      totalValue,
      categoriesCount,
    };
  }

  private transformToDto(product: any, stock?: number): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      category: product.category?.name || '',
      brand: product.brand?.name || undefined,
      salePrice: Number(product.salePrice),
      costPrice: Number(product.costPrice),
      stock: stock || 0, // Will be calculated from inventory
      reorderLevel: product.reorderLevel,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
