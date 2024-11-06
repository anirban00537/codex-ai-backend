import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ModeStatusArray } from 'src/shared/constants/array.constants';

export class UpdatePaymentMethodRazorpaySettingsDto {
  @IsNotEmpty()
  @IsString()
  key_id: string;

  @IsNotEmpty()
  @IsString()
  key_secret: string;
}
