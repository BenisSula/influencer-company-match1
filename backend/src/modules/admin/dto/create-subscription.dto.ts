import { IsString, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  tenantId: string;

  @IsString()
  priceId: string;

  @IsString()
  @IsOptional()
  paymentMethodId?: string;
}
