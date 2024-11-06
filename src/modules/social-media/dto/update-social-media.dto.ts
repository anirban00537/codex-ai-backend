import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StatusOnOffArray } from 'src/shared/constants/array.constants';

export class UpdateSocialMediaDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsIn(StatusOnOffArray)
  status: number;

  @IsNotEmpty()
  @IsString()
  link: string;

  @IsOptional()
  @IsNumber()
  file_id: number;
}
