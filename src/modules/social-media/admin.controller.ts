import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { SocialMediaService } from './social-media.service';
import { CreateNewSocialMediaDto } from './dto/create-new-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @Post('create-new-social-media')
  createNewSocialMedia(@Body() payload: CreateNewSocialMediaDto) {
    return this.socialMediaService.createNewSocialMedia(payload);
  }

  @Get('get-social-media-list')
  getSocialMediaList(@Query() payload: any) {
    return this.socialMediaService.getSocialMediaListForAdmin(payload);
  }

  @Get('social-media-details-:id')
  getSocialMediaDetails(@Param('id') id: number) {
    return this.socialMediaService.getSocialMediaDetails(id);
  }

  @Post('update-social-media')
  updateSocialMedia(@Body() payload: UpdateSocialMediaDto) {
    return this.socialMediaService.updateSocialMedia(payload);
  }

  @Delete('delete-social-media-:id')
  deleteSocialMedia(@Param('id') id: number) {
    return this.socialMediaService.deleteSocialMedia(id);
  }
}
