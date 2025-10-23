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
    const { sku, ...productData } = createProductDto;

    // Check if SKU already exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists');
    }

    try {
      const product = await this.prisma.product.create({
        data: {
          sku,
          ...productData,
        },
      });

      return this.transformToDto(product);
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
      where.category = category;
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
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products: products.map((product) => this.transformToDto(product)),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.transformToDto(product);
  }

  async findBySku(sku: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { sku },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.transformToDto(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
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
      const product = await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
      });

      return this.transformToDto(product);
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
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const newStock =
      operation === 'add' ? product.stock + quantity : product.stock - quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: { stock: newStock },
    });

    return this.transformToDto(updatedProduct);
  }

  async getLowStockProducts(): Promise<ProductResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: { stock: 'asc' },
    });

    // Filter products where stock is less than or equal to reorder level
    const lowStockProducts = products.filter(
      (product) => product.stock <= product.reorderLevel,
    );

    return lowStockProducts.map((product) => this.transformToDto(product));
  }

  async getCategories(): Promise<string[]> {
    const products = await this.prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    return products.map((product) => product.category);
  }

  async getBrands(): Promise<string[]> {
    const products = await this.prisma.product.findMany({
      select: { brand: true } as any,
      distinct: ['brand'] as any,
    });

    return products.map((product: any) => product.brand).filter(Boolean);
  }

  private transformToDto(product: any): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      category: product.category,
      brand: product.brand,
      salePrice: Number(product.salePrice),
      costPrice: Number(product.costPrice),
      stock: product.stock,
      reorderLevel: product.reorderLevel,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
