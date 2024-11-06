import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { StatusOnOffArray } from 'src/shared/constants/array.constants';

export class AddNewProgramingLanguageDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsIn(StatusOnOffArray)
  status: number;
}
