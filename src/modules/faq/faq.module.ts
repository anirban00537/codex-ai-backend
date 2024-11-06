import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserFaqController } from './user-faq.controller';
import { AdminFaqController } from './admin-faq.controller';
import { FaqService } from './faq.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserFaqController, AdminFaqController],
  providers: [FaqService],
})
export class FaqModule {}
