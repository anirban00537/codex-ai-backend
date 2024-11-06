import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateOpenAiChatDto {
  @IsNotEmpty()
  @IsNumber()
  chat_id: number;

  @IsNotEmpty()
  @IsString()
  title: string;
}
