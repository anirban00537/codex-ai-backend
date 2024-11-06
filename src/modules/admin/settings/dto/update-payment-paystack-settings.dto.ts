import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ModeStatusArray } from 'src/shared/constants/array.constants';

export class UpdatePaymentMethodPaystackSettingsDto {
  @IsNotEmpty()
  @IsString()
  public_key: string;

  @IsNotEmpty()
  @IsString()
  key_secret: string;

  @IsNotEmpty()
  @IsString()
  redirect_url: string;
}
