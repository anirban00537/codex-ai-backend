import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateNewReviewDto } from './dto/create-new-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('admin')
export class AdminReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create-new-review')
  createNewReview(@Body() payload: CreateNewReviewDto) {
    return this.reviewService.createNewReview(payload);
  }

  @Get('get-review-list')
  getReviewList(@Query() payload: any) {
    return this.reviewService.getReviewListForAdmin(payload);
  }

  @Get('review-details-:id')
  getReviewDetails(@Param('id') id: number) {
    return this.reviewService.getReviewDetails(id);
  }

  @Post('update-review')
  updateReview(@Body() payload: UpdateReviewDto) {
    return this.reviewService.updateReview(payload);
  }

  @Delete('delete-review-:id')
  deleteReview(@Param('id') id: number) {
    return this.reviewService.deleteReview(id);
  }
}
