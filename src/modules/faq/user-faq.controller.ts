import { Controller, Get, Query } from '@nestjs/common';
import { FaqService } from './faq.service';
import { GetFaqListByTypePaginate } from './dto/get-list-faq.dto';

@Controller('user-faq')
export class UserFaqController {
  constructor(private readonly faqService: FaqService) { }
  
  @Get('list')
  getFaqList(@Query() payload: GetFaqListByTypePaginate)
  {
    return this.faqService.getListFaq(payload);
  }
}
