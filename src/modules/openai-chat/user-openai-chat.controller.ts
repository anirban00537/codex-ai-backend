import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { StartNewChat } from './dto/start-new-chat.dto';
import { OpenAiChatService } from './openai-chat.service';
import { SendOpenAiChatMessageDto } from './dto/send-openai-chat-message.dto';
import { Subscription } from 'src/shared/decorators/subcription.decorators';
import { use } from 'passport';
import { UpdateOpenAiChatDto } from './dto/update-openai-chat.dto';

@Controller('user')
export class UserOpenAiChatController {
  constructor(private readonly openAiChatService: OpenAiChatService) {}

  @Get('get-openai-chat-category-list')
  getOpenAiActiveChatCategoryList(
    @UserInfo() user: User,
    @Query() payload: any,
  ) {
    return this.openAiChatService.getOpenAiActiveChatCategoryList(
      user,
      payload,
    );
  }

  @Subscription('chat_bot')
  @Post('start-new-chat')
  startNewChat(@UserInfo() user: User, @Body() payload: StartNewChat) {
    return this.openAiChatService.startNewChat(user, payload);
  }

  @Get('get-openai-chat-list-category-:id')
  getOpenAiChatCategoryList(
    @UserInfo() user: User,
    @Param('id') id: number,
    @Query() payload: any,
  ) {
    return this.openAiChatService.getOpenAiChatCategoryList(user, id, payload);
  }

  @Get('get-openai-chat-details-:id')
  getOpenAiChatDetails(
    @UserInfo() user: User,
    @Param('id') id: number,
    @Query() payload: any,
  ) {
    return this.openAiChatService.getOpenAiChatDetails(user, id, payload);
  }

  @Subscription('chat_bot')
  @Post('send-openai-chat-message')
  sendOpenAiChatMessage(
    @UserInfo() user: User,
    @Body() payload: SendOpenAiChatMessageDto,
  ) {
    return this.openAiChatService.sendOpenAiChatMessage(user, payload);
  }

  @Post('update-chat-title')
  updateChatTitle(
    @UserInfo() user: User,
    @Body() payload: UpdateOpenAiChatDto,
  ) {
    return this.openAiChatService.updateChatTitle(user, payload);
  }

  @Delete('delete-openai-chat-details-:id')
  deleteOpenAiChatDetails(@UserInfo() user: User, @Param('id') id: number) {
    return this.openAiChatService.deleteOpenAiChatDetails(user, id);
  }
}
