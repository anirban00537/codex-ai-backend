import { Module } from '@nestjs/common';
import { TrustedOrganizationController } from './trusted.controller';
import { TrustedOrganizationService } from './trusted.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  controllers: [TrustedOrganizationController],
  providers: [TrustedOrganizationService],
  imports: [PrismaModule],
  exports: [TrustedOrganizationService],
})
export class TrustedOrganizationModule {}
