import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { SocialMediaService } from './social-media.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [SocialMediaService],
  exports: [SocialMediaService],
})
export class SocialMediaModule {}
