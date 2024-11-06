import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ProgramingLanguageService } from './programing-language.service';
import { AddNewProgramingLanguageDto } from './dto/add-programing-language.dto';
import { UpdateProgramingLanguageDto } from './dto/update-programing-language.dto';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';

@IsAdmin()
@Controller('admin-dashboard')
export class AdminProgramingLanguageController {
  constructor(
    private readonly programingLanguageService: ProgramingLanguageService,
  ) {}

  @Post('add-new-programing-language')
  addNewProgramingLanguage(@Body() payload: AddNewProgramingLanguageDto) {
    return this.programingLanguageService.addNewProgramingLanguage(payload);
  }

  @Get('get-programing-language-list')
  getProgramingLanguageListForAdmin(@Query() payload: any) {
    return this.programingLanguageService.getProgramingLanguageListForAdmin(
      payload,
    );
  }

  @Get('get-programing-language-details-:id')
  getProgramingLanguageDetails(@Param('id') id: number) {
    console.log(id);
    return this.programingLanguageService.getProgramingLanguageDetails(id);
  }

  @Post('update-programing-language')
  updateProgramingLanguage(@Body() payload: UpdateProgramingLanguageDto) {
    return this.programingLanguageService.updateProgramingLanguage(payload);
  }

  @Delete('delete-programing-language-:id')
  deleteProgramingLanguage(@Param('id') id: number) {
    return this.programingLanguageService.deleteProgramingLanguage(id);
  }
}
