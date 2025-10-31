import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GenerateExpenseReportDto } from './dto/generate-expense-report.dto';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CompanyId } from '../auth/decorators/company-id.decorator';

@Controller('reports')
@UseGuards(AuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('expenses')
  generateExpenseReport(
    @Body() dto: GenerateExpenseReportDto,
    @CompanyId() companyId: string,
  ) {
    return this.reportsService.generateExpenseReport(dto, companyId);
  }
}
