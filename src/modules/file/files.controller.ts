import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ResponseModel } from 'src/shared/models/response.model';

import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/shared/decorators/public.decorator';
import path from 'path';
import { multerUploadConfig } from 'src/shared/configs/multer-upload.config';
import { Response } from 'express';
import { FilesService } from './files.service';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { User } from '@prisma/client';
import { coreConstant } from 'src/shared/helpers/coreConstant';

@Controller('file')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerUploadConfig))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file, 'file');
    return 'done';
  }

  @Get('my-uploaded-images')
  myUploadedImages(@UserInfo() user: User) {
    return this.filesService.getMyUploadedFiles(user);
  }

  @Get(':filename')
  @Public()
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(filename, {
      root: path.resolve(`./{${coreConstant.FILE_DESTINATION}}`),
    });
  }
}
