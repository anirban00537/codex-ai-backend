import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateDocumentDto {
  @IsNotEmpty()
  @IsNumber()
  document_id: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  result: string;
}
