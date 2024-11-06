import { IsNotEmpty, IsNumber } from 'class-validator';

export class StartNewChat {
  @IsNotEmpty()
  @IsNumber()
  chat_category_id: number;
}
