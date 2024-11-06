import { Module, NestModule, RequestMethod } from '@nestjs/common';
import { MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { MailConfig } from 'src/shared/configs/mail.config';
import { UsersModule } from '../users/users.module';
import { ApiSecretCheckMiddleware } from 'src/shared/middlewares/apisecret.middleware';
import { FilesModule } from '../file/files.module';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import { SettingsModule } from '../admin/settings/settings.module';
import { PaymentsModule } from '../payments/payments.module';
import { BigIntTransformInterceptor } from 'src/shared/utils/transform.interseptor';
import googleauthConfig from 'src/shared/configs/googleauth.config';
import { TemplateModule } from '../templates/templates.module';
import { CheckDemoMode } from 'src/shared/middlewares/check-demo.middleware';
import { FaqModule } from '../faq/faq.module';
import { PublicModule } from '../public/public.module';
import { TrustedOrganizationModule } from '../admin/trusted-organization/trusted.module';
import { ReviewModule } from '../review/review.module';
import { FeatureAiModule } from '../feature-ai/feature-ai.module';
import { ProgramingLanguageModule } from '../programing-language/programing-language.module';
import { SocialMediaModule } from '../social-media/social-media.module';
import { OpenAiChatModule } from '../openai-chat/openai-chat.module';
import { MailerService } from 'src/shared/mail/mailer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [MailConfig, googleauthConfig],
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    FilesModule,
    SettingsModule,
    PaymentsModule,
    TemplateModule,
    FaqModule,
    PublicModule,
    TrustedOrganizationModule,
    ReviewModule,
    FeatureAiModule,
    ProgramingLanguageModule,
    SocialMediaModule,
    OpenAiChatModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: BigIntTransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiSecretCheckMiddleware)
      .exclude({
        path: `/${coreConstant.FILE_DESTINATION}/*`,
        method: RequestMethod.ALL,
      })
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    consumer
      .apply(CheckDemoMode)
      .exclude(
        {
          path: `/user/generate-content`,
          method: RequestMethod.POST,
        },
        { path: '/auth/login', method: RequestMethod.POST },
        { path: '/user/generate-image', method: RequestMethod.POST },
        { path: '/user/generate-image', method: RequestMethod.POST },
        { path: '/user/make-template-favourite', method: RequestMethod.POST },
        { path: '/user/generate-code', method: RequestMethod.POST },
        { path: '/user/text-translate', method: RequestMethod.POST },
        { path: '/auth/google-login', method: RequestMethod.POST },
        { path: '/user/generate-transcription', method: RequestMethod.POST },
        { path: '/user/generate-csv', method: RequestMethod.POST },
        { path: '/user/send-openai-chat-message', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
