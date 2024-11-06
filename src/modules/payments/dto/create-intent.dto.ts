import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsString,
  IsNumber,
  Validate,
} from 'class-validator';

export class createIntentDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
