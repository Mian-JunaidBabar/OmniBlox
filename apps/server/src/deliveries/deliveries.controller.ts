import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { DeliveriesService } from './deliveries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CompanyId } from '../auth/decorators/company-id.decorator';
import { DeliveryResponseDto } from './dto/delivery-response.dto';
import { DispatchDeliveryDto } from './dto/dispatch-delivery.dto';

@Controller('deliveries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get()
  async findAll(
    @CompanyId() companyId: string,
  ): Promise<DeliveryResponseDto[]> {
    return this.deliveriesService.findAll(companyId);
  }

  @Patch(':id/dispatch')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  async dispatch(
    @Param('id') id: string,
    @CompanyId() companyId: string,
    @Body() dto: DispatchDeliveryDto,
  ): Promise<DeliveryResponseDto> {
    return this.deliveriesService.dispatch(id, companyId, dto);
  }

  @Patch(':id/complete')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  async complete(
    @Param('id') id: string,
    @CompanyId() companyId: string,
  ): Promise<DeliveryResponseDto> {
    return this.deliveriesService.complete(id, companyId);
  }
}
