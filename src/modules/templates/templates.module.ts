import { Module } from "@nestjs/common";
import { PrismaModule } from "src/modules/prisma/prisma.module";
import { AdminTemplateController } from './admin-templates.controller';
import { TemplateService } from "./templates.service";
import { UserTemplateController } from "./user-templates.controller";
import { PaymentsService } from "../payments/payments.service";

@Module({
  imports: [PrismaModule],
  controllers: [AdminTemplateController, UserTemplateController],
  providers: [TemplateService, PaymentsService],
  exports: [TemplateService],
})
export class TemplateModule {}
