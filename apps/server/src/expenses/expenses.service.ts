import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UpdateExpenseStatusDto } from './dto/update-expense-status.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExpenseDto, userId: string, companyId: string) {
    // Verify category exists and belongs to company
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id: dto.categoryId, companyId },
    });

    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    return this.prisma.expense.create({
      data: {
        reference: dto.reference,
        amount: dto.amount,
        expenseDate: new Date(dto.expenseDate),
        description: dto.description,
        vendor: dto.vendor,
        status: 'PENDING',
        categoryId: dto.categoryId,
        userId,
        companyId,
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(companyId: string, page = 1, limit = 50, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { companyId };

    if (search) {
      where.OR = [
        { reference: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: {
          category: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { expenseDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      expenses: expenses.map((exp) => ({
        ...exp,
        amount: exp.amount.toString(),
      })),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, companyId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id, companyId },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        attachments: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return {
      ...expense,
      amount: expense.amount.toString(),
    };
  }

  async update(id: string, companyId: string, dto: UpdateExpenseDto) {
    const expense = await this.findOne(id, companyId);

    // If categoryId is being updated, verify it exists
    if (dto.categoryId) {
      const category = await this.prisma.expenseCategory.findUnique({
        where: { id: dto.categoryId, companyId },
      });

      if (!category) {
        throw new NotFoundException('Expense category not found');
      }
    }

    const updated = await this.prisma.expense.update({
      where: { id: expense.id },
      data: {
        ...(dto.reference !== undefined && { reference: dto.reference }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.expenseDate !== undefined && {
          expenseDate: new Date(dto.expenseDate),
        }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.vendor !== undefined && { vendor: dto.vendor }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.paymentMethod !== undefined && {
          paymentMethod: dto.paymentMethod,
        }),
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return {
      ...updated,
      amount: updated.amount.toString(),
    };
  }

  async updateStatus(
    id: string,
    companyId: string,
    dto: UpdateExpenseStatusDto,
  ) {
    const expense = await this.findOne(id, companyId);

    const updated = await this.prisma.expense.update({
      where: { id: expense.id },
      data: { status: dto.status },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return {
      ...updated,
      amount: updated.amount.toString(),
    };
  }

  async remove(id: string, companyId: string) {
    const expense = await this.findOne(id, companyId);

    await this.prisma.expense.delete({
      where: { id: expense.id },
    });
  }

  async getStats(companyId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: { companyId },
      select: {
        amount: true,
        status: true,
      },
    });

    const stats = expenses.reduce(
      (acc, exp) => {
        const amount = Number(exp.amount);
        if (exp.status === 'PENDING') acc.totalPending += amount;
        if (exp.status === 'APPROVED') acc.totalApproved += amount;
        if (exp.status === 'PAID') acc.totalPaid += amount;
        return acc;
      },
      { totalPending: 0, totalApproved: 0, totalPaid: 0 },
    );

    return stats;
  }
}
