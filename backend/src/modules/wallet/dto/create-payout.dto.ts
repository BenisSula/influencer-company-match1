import { IsNumber, IsPositive, Min } from 'class-validator';

export class CreatePayoutDto {
  @IsNumber()
  @IsPositive()
  @Min(10) // Minimum $10 payout
  amount: number;
}
