import {
  IsOptional,
  IsInt,
  IsString,
  IsNumber,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { IsIn } from 'class-validator';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import { IsNotNegative } from 'src/shared/validator/not-negative.validator';

export class UpdatePaymentDto {
  @IsInt()
  @IsOptional()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsNotNegative('price')
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsIn([
    coreConstant.PACKAGE_DURATION.MONTHLY,
    coreConstant.PACKAGE_DURATION.WEEKLY,
    coreConstant.PACKAGE_DURATION.YEARLY,
  ])
  duration?: number;

  @IsOptional()
  @IsNumber()
  type?: number;

  @IsOptional()
  @IsNumber()
  total_words?: number;

  @IsOptional()
  @IsNumber()
  total_images?: number;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsNumber()
  total_purchase?: number;

  @IsString()
  @IsNotEmpty()
  model_name: string;

  @IsString()
  @IsNotEmpty()
  available_features: string;

  @IsString()
  feature_description_lists: string;
}
