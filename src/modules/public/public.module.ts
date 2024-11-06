import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { TrustedOrganizationService } from '../admin/trusted-organization/trusted.service';
import { SettingService } from '../admin/settings/settings.service';
import { ReviewService } from '../review/review.service';
import { PaymentsService } from '../payments/payments.service';
import { FeatureAiService } from '../feature-ai/feature-ai.service';
import { SocialMediaService } from '../social-media/social-media.service';
import { MailerService } from 'src/shared/mail/mailer.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicController],
  providers: [
    PublicService,
    TrustedOrganizationService,
    SettingService,
    ReviewService,
    PaymentsService,
    FeatureAiService,
    SocialMediaService,
    MailerService,
  ],
  exports: [PublicService],
})
export class PublicModule {}
