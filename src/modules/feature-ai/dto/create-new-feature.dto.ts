import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ReviewArray,
  StatusOnOffArray,
} from 'src/shared/constants/array.constants';

export class CreateNewFeatureAiDto {
  @IsNotEmpty()
  @IsString()
  category_name: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @IsIn(StatusOnOffArray)
  status: number;

  @IsOptional()
  @IsNumber()
  file_id: number;
}
