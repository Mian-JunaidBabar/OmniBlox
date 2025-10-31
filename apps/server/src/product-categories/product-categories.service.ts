import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductCategoryDto, companyId: string) {
    // Check if category with same name already exists for this company
    const existing = await this.prisma.productCategory.findFirst({
      where: {
        name: dto.name,
        companyId,
      },
    });

    if (existing) {
      throw new ConflictException('A category with this name already exists');
    }

    return this.prisma.productCategory.create({
      data: {
        name: dto.name,
        companyId,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.productCategory.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        companyId: true,
      },
    });
  }

  async findOne(id: string, companyId: string) {
    const category = await this.prisma.productCategory.findFirst({
      where: { id, companyId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, dto: UpdateProductCategoryDto, companyId: string) {
    // Verify category exists and belongs to company
    await this.findOne(id, companyId);

    // Check if another category with same name exists (excluding current one)
    const existing = await this.prisma.productCategory.findFirst({
      where: {
        name: dto.name,
        companyId,
        id: { not: id },
      },
    });

    if (existing) {
      throw new ConflictException('A category with this name already exists');
    }

    return this.prisma.productCategory.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async remove(id: string, companyId: string) {
    // Verify category exists and belongs to company
    await this.findOne(id, companyId);

    // Check if category is being used by any products
    const productsCount = await this.prisma.product.count({
      where: { categoryId: id, companyId },
    });

    if (productsCount > 0) {
      throw new ConflictException(
        `Cannot delete category. It is being used by ${productsCount} product(s)`,
      );
    }

    await this.prisma.productCategory.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }
}
