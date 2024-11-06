import { Controller, Get } from '@nestjs/common';
import { PublicService } from './public.service';
import { ResponseModel } from 'src/shared/models/response.model';
import { Public } from 'src/shared/decorators/public.decorator';
  @Public()
  @Controller('public-api')
  export class PublicController {
    constructor(private readonly publicService: PublicService) {}

    @Get('language-list')
    getAllLanguageList() {
      return this.publicService.getAllLanguageList();
    }

    @Get('common-settings')
    commonSettings(): Promise<ResponseModel> {
      return this.publicService.commonSettings();
    }

    @Get('landing-page-data')
    getLandingPageData(): Promise<ResponseModel> {
      return this.publicService.getLandingPageData();
    }
  }
