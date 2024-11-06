import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { StatusOnOffArray } from 'src/shared/constants/array.constants';

export class UpdateCategoryDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @IsIn(StatusOnOffArray)
  status: number;
}
