import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  GetCurrentCompanyId,
  GetCurrentUserId,
} from '../auth/decorators/current-user.decorator';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateExpenseDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.expensesService.create(dto, userId, companyId);
  }

  @Get()
  async findAll(
    @GetCurrentCompanyId() companyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.expensesService.findAll(
      companyId,
      pageNum,
      limitNum,
      search,
      category,
      startDate,
      endDate,
    );
  }

  @Get('stats')
  async getStats(@GetCurrentCompanyId() companyId: string) {
    return this.expensesService.getStats(companyId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.expensesService.findOne(id, companyId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.expensesService.update(id, dto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @GetCurrentCompanyId() companyId: string,
  ) {
    await this.expensesService.remove(id, companyId);
  }
}
