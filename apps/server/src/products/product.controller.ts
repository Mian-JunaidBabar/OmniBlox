import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  GetCurrentCompanyId,
  GetCurrentUserId,
} from '../auth/decorators/current-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProductDto: CreateProductDto,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.productService.create(createProductDto, companyId);
  }

  @Get()
  async findAll(
    @GetCurrentCompanyId() companyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;

    return this.productService.findAll(
      companyId,
      pageNum,
      limitNum,
      search,
      category,
      status,
    );
  }

  @Get('categories')
  async getCategories(@GetCurrentCompanyId() companyId: string) {
    return this.productService.getCategories(companyId);
  }

  @Get('brands')
  async getBrands(@GetCurrentCompanyId() companyId: string) {
    return this.productService.getBrands(companyId);
  }

  @Get('low-stock')
  async getLowStockProducts(@GetCurrentCompanyId() companyId: string) {
    return this.productService.getLowStockProducts(companyId);
  }

  @Get('stats')
  async getStats(@GetCurrentCompanyId() companyId: string) {
    return this.productService.getStats(companyId);
  }

  @Get('sku/:sku')
  async findBySku(
    @Param('sku') sku: string,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.productService.findBySku(sku, companyId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.productService.findOne(id, companyId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.productService.update(id, updateProductDto, companyId);
  }

  @Put(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body() body: { quantity: number; operation: 'add' | 'subtract' },
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.productService.updateStock(
      id,
      body.quantity,
      body.operation,
      companyId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.productService.remove(id, companyId);
  }

  @Post('adjustments')
  @HttpCode(HttpStatus.CREATED)
  async createStockAdjustment(
    @Body() createStockAdjustmentDto: CreateStockAdjustmentDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.productService.createStockAdjustment(
      createStockAdjustmentDto,
      userId,
      companyId,
    );
  }

  @Get('adjustments')
  async getStockAdjustments(@GetCurrentCompanyId() companyId: string) {
    return this.productService.getStockAdjustments(companyId);
  }

  @Get('adjustments/:id')
  async getStockAdjustment(
    @Param('id') id: string,
    @GetCurrentCompanyId() companyId: string,
  ) {
    return this.productService.getStockAdjustment(id, companyId);
  }

  @Get('warehouses')
  async getWarehouses(@GetCurrentCompanyId() companyId: string) {
    return this.productService.getWarehouses(companyId);
  }
}
