import { IsNotEmpty, IsString } from 'class-validator';

export class JsonGenerate {
  @IsNotEmpty()
  @IsString()
  topic: string;
}
