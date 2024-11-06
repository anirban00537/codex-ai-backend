import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { OpenAiChatService } from './openai-chat.service';
import { CreateOpenAiChatCategoryDto } from './dto/create-openai-chat-category.dto';
import { UpdateOpenAiChatCategoryDto } from './dto/update-openai-chat-category.dto';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { StartNewChat } from './dto/start-new-chat.dto';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { User } from '@prisma/client';

@IsAdmin()
@Controller('admin')
export class AdminOpenAiChatController {
  constructor(private readonly openAiChatService: OpenAiChatService) {}

  @Post('create-chat-category')
  createChatCategory(@Body() payload: CreateOpenAiChatCategoryDto) {
    return this.openAiChatService.createChatCategory(payload);
  }

  @Get('openai-chat-category-list')
  getOpenAiChatCategoryList(@Query() payload: any) {
    return this.openAiChatService.getOpenAiChatCategoryListForAdmin(payload);
  }

  @Get('get-openai-chat-category-details-:id')
  getOpenAiChatCategoryDetails(@Param('id') id: number) {
    return this.openAiChatService.getOpenAiChatCategoryDetails(id);
  }

  @Post('update-chat-category')
  updateChatCategory(@Body() payload: UpdateOpenAiChatCategoryDto) {
    return this.openAiChatService.updateChatCategory(payload);
  }

  @Delete('delete-openai-chat-chategory-:id')
  deleteOpenAiChatCategory(@Param('id') id: number) {
    return this.openAiChatService.deleteOpenAiChatCategory(id);
  }
}
