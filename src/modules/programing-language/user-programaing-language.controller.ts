import { Controller, Get } from '@nestjs/common';
import { ProgramingLanguageService } from './programing-language.service';

@Controller('user')
export class UserProgramingLanguageController {
  constructor(
    private readonly programingLanguageService: ProgramingLanguageService,
  ) {}

  @Get('get-all-active-programing-language')
  getAllActiveProgramingLanguageList() {
    return this.programingLanguageService.getAllActiveProgramingLanguageList();
  }
}
