import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsString,
  IsNumber,
  Validate,
  IsJSON,
} from 'class-validator';
import { IsIn } from 'class-validator';
import { AvailableFeaturesArray } from 'src/shared/constants/array.constants';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import { IsNotNegative } from 'src/shared/validator/not-negative.validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsNotNegative('price') // Apply the custom validator
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @IsIn([
    coreConstant.PACKAGE_DURATION.MONTHLY,
    coreConstant.PACKAGE_DURATION.WEEKLY,
    coreConstant.PACKAGE_DURATION.YEARLY,
  ])
  duration: number;

  @IsNotEmpty()
  @IsNumber()
  type: number;

  @IsNotEmpty()
  @IsNumber()
  total_words: number;

  @IsNotEmpty()
  @IsNumber()
  total_images: number;

  @IsNotEmpty()
  @IsInt()
  status: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsNotEmpty()
  @IsString()
  available_features: string;

  @IsNotEmpty()
  @IsString()
  model_name: string;

  @IsOptional()
  @IsString()
  feature_description_lists: string;
}
