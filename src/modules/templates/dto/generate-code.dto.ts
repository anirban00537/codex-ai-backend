import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CodingLevelArray } from 'src/shared/constants/array.constants';

export class GenerateOpenAiCodeDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  coding_language: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(CodingLevelArray)
  coding_level: string;
}
