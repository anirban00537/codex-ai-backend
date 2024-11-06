import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StatusOnOffArray } from 'src/shared/constants/array.constants';

export class CreateNewSocialMediaDto {
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

  @IsNotEmpty()
  @IsNumber()
  file_id: number;
}
