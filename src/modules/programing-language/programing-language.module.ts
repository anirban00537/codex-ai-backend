import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminProgramingLanguageController } from './admin-programing-language.controller';
import { ProgramingLanguageService } from './programing-language.service';
import { UserProgramingLanguageController } from './user-programaing-language.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminProgramingLanguageController,
    UserProgramingLanguageController,
  ],
  providers: [ProgramingLanguageService],
  exports: [ProgramingLanguageService],
})
export class ProgramingLanguageModule {}
