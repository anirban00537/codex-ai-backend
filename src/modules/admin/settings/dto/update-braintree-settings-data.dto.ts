import { IsNotEmpty, IsString, IsNumber, IsIn } from 'class-validator';
import { ModeStatusArray } from 'src/shared/constants/array.constants';

export class UpdateBraintreeSettingsData {
  @IsNotEmpty()
  @IsNumber()
  @IsIn(ModeStatusArray)
  braintree_payment_mode: number;

  @IsNotEmpty()
  @IsString()
  braintree_merchant_id: string;

  @IsNotEmpty()
  @IsString()
  braintree_public_key: string;

  @IsNotEmpty()
  @IsString()
  braintree_private_key: string;

  @IsNotEmpty()
  @IsString()
  braintree_tokenization_keys: string;

  @IsNotEmpty()
  @IsString()
  braintree_google_merchant_id: string;
}
