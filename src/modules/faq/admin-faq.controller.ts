import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { paginateInterface } from 'src/shared/constants/types';
import { GetFaqListByTypePaginate } from './dto/get-list-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';

@IsAdmin()
@Controller('admin-faq')
export class AdminFaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post('create')
  createFaq(@Body() payload: CreateFaqDto) {
    return this.faqService.createFaq(payload);
  }

  @Get('list')
  getListFaq(@Query() payload: GetFaqListByTypePaginate) {
    return this.faqService.getListFaq(payload);
  }

  @Post('update')
  updateFaq(@Body() payload: UpdateFaqDto) {
    return this.faqService.updateFaq(payload);
  }

  @Get('details-:id')
  getFaqDetails(@Param('id') id: number) {
    return this.faqService.getFaqDetails(id);
  }

  @Delete('delete-:id')
  deleteFaq(@Param('id') id: number) {
    return this.faqService.deleteFaq(id);
  }
}
