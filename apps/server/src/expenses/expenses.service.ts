import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import {
  ExpenseResponseDto,
  ExpensesListResponseDto,
  ExpenseStatsDto,
} from './dto/expense-response.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateExpenseDto,
    userId: string,
    companyId: string,
  ): Promise<ExpenseResponseDto> {
    const expense = await this.prisma.expense.create({
      data: {
        description: dto.description,
        amount: dto.amount,
        expenseDate: new Date(dto.expenseDate),
        category: dto.category,
        notes: dto.notes,
        userId,
        companyId,
      },
    });

    return this.transformExpense(expense);
  }

  async findAll(
    companyId: string,
    page = 1,
    limit = 10,
    search?: string,
    category?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ExpensesListResponseDto> {
    const skip = (page - 1) * limit;
    const where: any = { companyId };

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expenseDate: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      expenses: expenses.map((expense) => this.transformExpense(expense)),
      total,
      pages: limit === 0 ? 1 : Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: string, companyId: string): Promise<ExpenseResponseDto> {
    const expense = await this.prisma.expense.findUnique({
      where: { id, companyId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return this.transformExpense(expense);
  }

  async update(
    id: string,
    dto: UpdateExpenseDto,
    companyId: string,
  ): Promise<ExpenseResponseDto> {
    const existingExpense = await this.prisma.expense.findUnique({
      where: { id, companyId },
    });

    if (!existingExpense) {
      throw new NotFoundException('Expense not found');
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: {
        description: dto.description,
        amount: dto.amount,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
        category: dto.category,
        notes: dto.notes,
      },
    });

    return this.transformExpense(updatedExpense);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const expense = await this.prisma.expense.findUnique({
      where: { id, companyId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    await this.prisma.expense.delete({
      where: { id },
    });
  }

  async getStats(companyId: string): Promise<ExpenseStatsDto> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalExpenses,
      totalAmount,
      currentMonthAmount,
      previousMonthAmount,
    ] = await Promise.all([
      this.prisma.expense.count({ where: { companyId } }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: { companyId },
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: {
          companyId,
          expenseDate: { gte: currentMonthStart },
        },
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: {
          companyId,
          expenseDate: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
      }),
    ]);

    const currentMonth = this.decimalToNumber(currentMonthAmount._sum.amount);
    const previousMonth = this.decimalToNumber(previousMonthAmount._sum.amount);
    const monthlyChange =
      previousMonth > 0
        ? ((currentMonth - previousMonth) / previousMonth) * 100
        : 0;

    return {
      totalExpenses,
      totalAmount: this.decimalToNumber(totalAmount._sum.amount),
      currentMonthAmount: currentMonth,
      previousMonthAmount: previousMonth,
      monthlyChange: Math.round(monthlyChange * 100) / 100,
    };
  }

  private decimalToNumber(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }
    return typeof value === 'number' ? value : Number(value);
  }

  private transformExpense(expense: any): ExpenseResponseDto {
    return {
      id: expense.id,
      description: expense.description,
      amount: this.decimalToNumber(expense.amount),
      expenseDate: expense.expenseDate.toISOString(),
      category: expense.category,
      notes: expense.notes,
      userId: expense.userId,
      companyId: expense.companyId,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    };
  }
}
