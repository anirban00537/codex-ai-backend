import { Module } from "@nestjs/common";
import { SettingService } from "./settings.service";
import { SettingController } from "./settings.controller";
import { PrismaModule } from "src/modules/prisma/prisma.module";
import { MailerService } from "src/shared/mail/mailer.service";
import { PrismaService } from "src/modules/prisma/prisma.service";

@Module({
  controllers: [SettingController],
  providers: [SettingService,PrismaService,MailerService],
  exports: [ MailerService],
})
export class SettingsModule {}