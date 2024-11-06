import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateOpenAISettingsDto {
  @IsOptional()
  @IsString()
  open_ai_secret: string;

  @IsNotEmpty()
  @IsString()
  open_ai_model: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(2)
  open_ai_temperature: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  open_ai_max_output_length: number;
}
