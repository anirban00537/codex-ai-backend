import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StatusOnOffArray } from 'src/shared/constants/array.constants';

export class UpdateTermsPrivacyDto {
  @IsOptional()
  @IsNumber()
  @IsIn(StatusOnOffArray)
  privacy_policy_status: number;

  @IsOptional()
  @IsString()
  privacy_policy: string;

  @IsOptional()
  @IsString()
  terms_condition: string;

  @IsOptional()
  @IsNumber()
  @IsIn(StatusOnOffArray)
  terms_condition_status: number;
}
