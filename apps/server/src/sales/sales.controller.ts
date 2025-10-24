import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateSaleDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.salesService.create(dto, userId, companyId);
  }

  @Get()
  async findAll(
    @GetCurrentCompanyId() companyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.salesService.findAll(
      companyId,
      pageNum,
      limitNum,
      search,
      status,
      paymentStatus,
    );
  }

  @Get('stats')
  async stats(@GetCurrentCompanyId() companyId: string) {
    return this.salesService.getStats(companyId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.salesService.findOne(id, companyId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSaleDto,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.salesService.update(id, dto, companyId);
  }

  @Patch(':id/mark-paid')
  async markAsPaid(
    @Param('id') id: string,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.salesService.markAsPaid(id, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @GetCurrentCompanyId() companyId: string,
  ) {
    await this.salesService.remove(id, companyId);
  }
}
