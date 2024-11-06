import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GenerateImageDto } from './dto/generate-image.dto';
import { TemplateService } from './templates.service';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { User } from '@prisma/client';
import { Subscription } from 'src/shared/decorators/subcription.decorators';
import { paginateInterface } from 'src/shared/constants/types';
import { MakeTemplateFavourite } from './dto/make-template-favourite.dto';
import { GenerateOpenAiCodeDto } from './dto/generate-code.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { TextTranslateDto } from './dto/text-translate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { JsonGenerate } from './dto/json-generate.dto';
@Controller('user')
export class UserTemplateController {
  constructor(private readonly templateService: TemplateService) {}
  @Subscription('text')
  @Post('generate-content')
  generateOpenAiContent(
    @UserInfo() user: User,
    @Body()
    payload: any,
  ) {
    return this.templateService.generateContent(user, payload);
  }
  @Subscription('image')
  @Post('generate-image')
  generateImage(
    @UserInfo() user: User,
    @Body()
    payload: GenerateImageDto,
  ) {
    return this.templateService.generateImage(user, payload);
  }
  @Subscription('transcription')
  @UseInterceptors(FileInterceptor('audio'))
  @Post('generate-transcription')
  async transcriptionGenerateOpenAiController(
    @UploadedFile() audio: any,
    @UserInfo() user: User,
  ) {
    const baseDir = path.resolve(__dirname, '../../../..');
    const uniqueFilename = Date.now() + '-' + audio.originalname;
    const filePath = path.join(baseDir, 'uploads', uniqueFilename);
    fs.writeFileSync(filePath, audio.buffer);
    const transcriptionResult =
      await this.templateService.transcriptionGenerateOpenAi(user, filePath);

    return transcriptionResult;
  }
  @Get('transcription-list')
  getTransacriptionsByPaginate(@Query() payload: any, @UserInfo() user: User) {
    return this.templateService.getTransacriptionsByPaginate(payload, user);
  }
  @Get('document-list')
  getDocumentListByPaginate(@Query() payload: any, @UserInfo() user: User) {
    return this.templateService.getDocumentListByPaginate(payload, user);
  }
  @Get('favourite-list')
  getFavouriteListByPaginate(
    @Query() payload: paginateInterface,
    @UserInfo() user: User,
  ) {
    return this.templateService.getFavouriteListByPaginate(payload, user);
  }
  @Get('my-image-list')
  getAllImageDocument(
    @Query() payload: paginateInterface,
    @UserInfo() user: User,
  ) {
    return this.templateService.getAllImageDocument(user, payload);
  }

  @Get('document-details-:id')
  getUserDocumentDetails(@Param('id') id: number, @UserInfo() user: User) {
    return this.templateService.getUserDocumentDetails(id, user);
  }
  @Get('transcription-details-:id')
  getUserTranscriptionDetails(@Param('id') id: number, @UserInfo() user: User) {
    return this.templateService.getUserTranscriptionDetails(id, user);
  }
  @Delete('delete-transcription-:id')
  deleteTranscriptionDetails(@Param('id') id: number, @UserInfo() user: User) {
    return this.templateService.deleteTranscriptionDetails(id, user);
  }
  @Get('image-details-:id')
  getImageDocumentDetails(@Param('id') id: number, @UserInfo() user: User) {
    return this.templateService.getImageDocumentDetails(id, user);
  }

  @Get('category-list')
  getListCategoryForUser(@Query() payload: any) {
    return this.templateService.getListCategoryForUser(payload);
  }

  @Get('get-template-list')
  getTemplateListForUser(@UserInfo() user: User, @Query() payload: any) {
    return this.templateService.getTemplateListForUser(user, payload);
  }

  @Get('template-details-:id')
  getTemplateDetails(@Param('id') id: number) {
    return this.templateService.getTemplateDetails(id);
  }

  @Post('make-template-favourite')
  makeTemplateFavourite(
    @UserInfo() user: User,
    @Body() payload: MakeTemplateFavourite,
  ) {
    return this.templateService.makeTemplateFavourite(user, payload);
  }

  @Subscription('code')
  @Post('generate-code')
  generateOpenAiCode(
    @UserInfo() user: User,
    @Body() payload: GenerateOpenAiCodeDto,
  ) {
    return this.templateService.generateOpenAiCode(user, payload);
  }
  @Subscription('csv')
  @Post('generate-csv')
  generateJsonForCsv(@UserInfo() user: User, @Body() payload: JsonGenerate) {
    return this.templateService.generateJsonForCsv(user, payload);
  }
  @Get('get-generated-code-list')
  getGeneratedCodeListOfUser(@UserInfo() user: User, @Query() payload: any) {
    return this.templateService.getGeneratedCodeListOfUser(user, payload);
  }
  @Get('get-generated-csv-list')
  getGeneratedCsvListOfUser(
    @UserInfo() user: User,
    @Query() payload: paginateInterface,
  ) {
    return this.templateService.getGeneratedCsvListOfUser(user, payload);
  }
  @Get('get-generated-code-details-:id')
  getGeneratedCodeDetails(@Param('id') id: number, @UserInfo() user: User) {
    return this.templateService.getGeneratedCodeDetails(id, user);
  }
  @Get('get-generated-csv-details-:id')
  getGeneratedCsvDetails(@Param('id') id: number, @UserInfo() user: User) {
    return this.templateService.getGeneratedCsvDetails(id, user);
  }

  @Delete('delete-generated-code-:id')
  deleteGeneratedCode(@Param('id') id: number, @UserInfo() user: User) {
    return this.templateService.deleteGeneratedCode(id, user);
  }
  @Delete('delete-generated-csv-:id')
  deleteGeneratedCsv(@Param('id') id: number, @UserInfo() user: User) {
    return this.templateService.deleteGeneratedCsv(id, user);
  }
  @Post('update-document-user')
  updateDocumentByUser(
    @UserInfo() user: User,
    @Body() payload: UpdateDocumentDto,
  ) {
    return this.templateService.updateDocumentByUser(user, payload);
  }

  @Get('language-list')
  getAllLanguageList() {
    return this.templateService.getAllLanguageList();
  }

  @Delete('delete-document-:id')
  deleteDocument(@UserInfo() user: User, @Param('id') id: number) {
    return this.templateService.deleteDocument(id, user);
  }
  @Subscription('translation')
  @Post('text-translate')
  textTranslate(@UserInfo() user: User, @Body() payload: TextTranslateDto) {
    return this.templateService.textTranslate(user, payload);
  }

  @Get('get-generated-translation-list')
  getGeneratedTranslationList(@UserInfo() user: User, @Query() payload: any) {
    return this.templateService.getGeneratedTranslationList(user, payload);
  }

  @Get('get-generated-translation-details-:id')
  getGeneratedTranslationDetails(
    @Param('id') id: number,
    @UserInfo() user: User,
  ) {
    return this.templateService.getGeneratedTranslationDetails(id, user);
  }

  @Delete('delete-generated-translation-:id')
  deleteGeneratedTranslation(@Param('id') id: number) {
    return this.templateService.deleteGeneratedTranslation(id);
  }

  @Get('get-my-uses-history-list')
  getMyUsesHistoryList(@UserInfo() user: User, @Query() payload: any) {
    return this.templateService.getMyUsesHistoryList(user, payload);
  }
}
