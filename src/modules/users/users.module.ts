import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { UserVerificationCodeService } from '../verification_code/user-verify-code.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminController } from './admin.controller';
import { MailerService } from 'src/shared/mail/mailer.service';

@Module({
  controllers: [UserController, AdminController],
  providers: [UsersService, UserVerificationCodeService, MailerService],
  imports: [PrismaModule],
  exports: [UsersService, MailerService],
})
export class UsersModule {}
