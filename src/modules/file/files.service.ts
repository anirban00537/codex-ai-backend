import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import {
  addPhotoPrefix,
  errorResponse,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyUploadedFiles(user: User): Promise<ResponseModel> {
    try {
      const myFiles = await this.prisma.myUploads.findMany({
        where: {
          user_id: user.id,
        },
      });

      if (!myFiles) {
        return errorResponse('No files found');
      }

      // Map through the myFiles array and apply addPhotoPrefix to file_path field
      const filesWithPrefix = myFiles.map((file) => ({
        ...file,
        file_path: addPhotoPrefix(file.file_path),
      }));

      return successResponse('Upload successful', filesWithPrefix);
    } catch (error) {
      processException(error);
    }
  }
}
