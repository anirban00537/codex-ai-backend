import { Module } from '@nestjs/common';
import { AdminReviewController } from './admin-review.controller';
import { ReviewService } from './review.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [AdminReviewController],
  providers: [ReviewService],
  imports: [PrismaModule],
  exports: [ReviewService],
})
export class ReviewModule {}
