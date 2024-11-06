import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ModeStatusArray } from 'src/shared/constants/array.constants';

export class UpdatePaymentMethodStripeSettingsDto {
  @IsNotEmpty()
  @IsString()
  pm_stripe_client_id_live: string;

  @IsNotEmpty()
  @IsString()
  pm_stripe_secret_key_live: string;
}
