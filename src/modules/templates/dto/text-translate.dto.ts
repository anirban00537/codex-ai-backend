import { IsNotEmpty, IsString } from 'class-validator';

export class TextTranslateDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsString()
  language: string;
}
