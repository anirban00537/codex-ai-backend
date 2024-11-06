import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendOpenAiChatMessageDto {
  @IsNotEmpty()
  @IsNumber()
  openai_chat_id: number;

  @IsNotEmpty()
  @IsString()
  message: string;
}
