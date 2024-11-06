import { Module } from '@nestjs/common';
import { AdminFeatureAiController } from './admin-feature-ai.controller';
import { FeatureAiService } from './feature-ai.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [AdminFeatureAiController],
  providers: [FeatureAiService],
  imports: [PrismaModule],
  exports: [FeatureAiService],
})
export class FeatureAiModule {}
