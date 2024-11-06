import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  FaqTypeArray,
  StatusOnOffArray,
} from 'src/shared/constants/array.constants';

export class UpdateFaqDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  @IsIn(FaqTypeArray)
  type: number;

  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNotEmpty()
  @IsString()
  answer: string;

  @IsNotEmpty()
  @IsNumber()
  @IsIn(StatusOnOffArray)
  status: number;
}
