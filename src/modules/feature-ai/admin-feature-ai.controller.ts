import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { FeatureAiService } from './feature-ai.service';
import { CreateNewFeatureAiDto } from './dto/create-new-feature.dto';
import { UpdateFeatureAiDto } from './dto/update-feature.dto';

@Controller('admin')
export class AdminFeatureAiController {
  constructor(private readonly featureAiService: FeatureAiService) {}

  @Post('add-new-feature')
  createNewFeatureOfAi(@Body() payload: CreateNewFeatureAiDto) {
    return this.featureAiService.createNewFeatureOfAi(payload);
  }

  @Get('get-feature-ai-list')
  getFeatureAiList(@Query() payload: any) {
    return this.featureAiService.getFeatureAiListForAdmin(payload);
  }

  @Get('feature-ai-details-:id')
  getFeatureOfAiDetails(@Param('id') id: number) {
    return this.featureAiService.getFeatureOfAiDetails(id);
  }

  @Post('update-feature-ai')
  updateFeatureOfAi(@Body() payload: UpdateFeatureAiDto) {
    return this.featureAiService.updateFeatureOfAi(payload);
  }

  @Delete('delete-feature-ai-:id')
  deleteFeatureOfAi(@Param('id') id: number) {
    return this.featureAiService.deleteFeatureOfAi(id);
  }
}
