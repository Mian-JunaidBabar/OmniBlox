import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  description: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  expenseDate: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
