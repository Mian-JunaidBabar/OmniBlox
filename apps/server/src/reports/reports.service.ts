import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateExpenseReportDto } from './dto/generate-expense-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateExpenseReport(
    dto: GenerateExpenseReportDto,
    companyId: string,
  ) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);

    // Build dynamic where clause
    const whereClause: any = {
      companyId,
      expenseDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Add optional filters
    if (dto.categoryId) {
      whereClause.categoryId = dto.categoryId;
    }

    if (dto.vendor) {
      whereClause.vendor = {
        contains: dto.vendor,
        mode: 'insensitive',
      };
    }

    // Get aggregated summary
    const summary = await this.prisma.expense.aggregate({
      where: whereClause,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get detailed expenses with relations
    const expenses = await this.prisma.expense.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });

    // Calculate category breakdown
    const categoryBreakdown = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where: whereClause,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get category names for breakdown
    const categoryIds = categoryBreakdown.map((item) => item.categoryId);
    const categories = await this.prisma.expenseCategory.findMany({
      where: {
        id: { in: categoryIds },
        companyId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

    const breakdownWithNames = categoryBreakdown.map((item) => ({
      categoryId: item.categoryId,
      categoryName: categoryMap.get(item.categoryId) || 'Unknown',
      totalAmount: item._sum.amount || 0,
      count: item._count.id,
    }));

    return {
      summary: {
        totalAmount: summary._sum.amount || 0,
        totalExpenses: summary._count.id,
        startDate: dto.startDate,
        endDate: dto.endDate,
        categoryFilter: dto.categoryId || null,
        vendorFilter: dto.vendor || null,
      },
      expenses,
      categoryBreakdown: breakdownWithNames,
    };
  }
}
