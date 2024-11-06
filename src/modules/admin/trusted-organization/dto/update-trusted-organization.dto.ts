import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { StatusOnOffArray } from 'src/shared/constants/array.constants';

export class UpdateTrustedOrganizationDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNumber()
  file_id: number;

  @IsNotEmpty()
  @IsNumber()
  @IsIn(StatusOnOffArray)
  status: number;
}
