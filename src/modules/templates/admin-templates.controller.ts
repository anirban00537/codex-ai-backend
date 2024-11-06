import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { TemplateService } from './templates.service';
import { AddNewCategoryDto } from './dto/add-new-category.dto';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AddNewTemplateDto } from './dto/add-new-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@IsAdmin()
@Controller('admin-template')
export class AdminTemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post('add-category')
  addNewCategory(@Body() payload: AddNewCategoryDto) {
    return this.templateService.addNewCategory(payload);
  }

  @Post('update-category')
  updateCategory(@Body() payload: UpdateCategoryDto) {
    return this.templateService.updateCategory(payload);
  }

  @Get('category-list')
  getListCategory(@Query() payload: any) {
    return this.templateService.getListCategory(payload);
  }

  @Get('get-all-active-category-list')
  getAllActiveCategoryList(@Query() payload: any) {
    return this.templateService.getAllActiveCategoryList(payload);
  }

  @Delete('delete-category-:id')
  deleteCategory(@Param('id') id: number) {
    return this.templateService.deleteCategory(id);
  }

  @Get('category-details-:id')
  getCategoryDetails(@Param('id') id: number) {
    return this.templateService.getCategoryDetails(id);
  }

  @Post('add-new-template')
  addNewCustomTemplate(@Body() payload: AddNewTemplateDto) {
    return this.templateService.addNewCustomTemplate(payload);
  }

  @Get('template-list')
  getTemplateList(@Query() payload: any) {
    return this.templateService.getTemplateList(payload);
  }

  @Get('template-details-:id')
  getTemplateDetails(@Param('id') id: number) {
    return this.templateService.getTemplateDetails(id);
  }

  @Post('update-template')
  updateTemplate(@Body() payload: UpdateTemplateDto) {
    return this.templateService.updateTemplate(payload);
  }

  @Delete('delete-template-:id')
  deleteTemplate(@Param('id') id: number) {
    return this.templateService.deleteTemplate(id);
  }

  @Get('document-list')
  getDocumentListByPaginate(@Query() payload: any) {
    return this.templateService.getDocumentListByPaginateAdmin(payload);
  }

  @Get('document-details-:id')
  getUserDocumentDetails(@Param('id') id: number) {
    return this.templateService.getDocumentDetails(id);
  }

  @Get('get-all-user-uses-history')
  getAllUserUsesHistory(@Query() payload: any) {
    return this.templateService.getAllUserUsesHistory(payload);
  }
}
