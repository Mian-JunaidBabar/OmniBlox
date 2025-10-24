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
  Request,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;

    return this.productService.findAll(
      pageNum,
      limitNum,
      search,
      category,
      status,
    );
  }

  @Get('categories')
  async getCategories() {
    return this.productService.getCategories();
  }

  @Get('brands')
  async getBrands() {
    return this.productService.getBrands();
  }

  @Get('low-stock')
  async getLowStockProducts() {
    return this.productService.getLowStockProducts();
  }

  @Get('stats')
  async getStats() {
    return this.productService.getStats();
  }

  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string) {
    return this.productService.findBySku(sku);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Put(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body() body: { quantity: number; operation: 'add' | 'subtract' },
  ) {
    return this.productService.updateStock(id, body.quantity, body.operation);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  @Post('adjustments')
  @HttpCode(HttpStatus.CREATED)
  async createStockAdjustment(
    @Body() createStockAdjustmentDto: CreateStockAdjustmentDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId;
    return this.productService.createStockAdjustment(
      createStockAdjustmentDto,
      userId,
    );
  }

  @Get('adjustments')
  async getStockAdjustments() {
    return this.productService.getStockAdjustments();
  }

  @Get('adjustments/:id')
  async getStockAdjustment(@Param('id') id: string) {
    return this.productService.getStockAdjustment(id);
  }

  @Get('warehouses')
  async getWarehouses() {
    return this.productService.getWarehouses();
  }
}
