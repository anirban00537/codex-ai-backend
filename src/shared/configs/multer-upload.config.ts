import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '../helpers/functions';
import { coreConstant } from '../helpers/coreConstant';

export const validImageUploadTypesRegex = /jpeg|jpg|png|gif|bmp|webp/;
export const maxImageUploadSize = 3 * 1024 * 1024; // 3MB

const uploadDirectory = `./${coreConstant.FILE_DESTINATION}`;
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

export const multerUploadConfig: MulterOptions = {
  storage: diskStorage({
    destination: uploadDirectory,
    filename: (request, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const user: any = request.user;
      const { originalname, mimetype } = file;
      const fileName = `${uniqueSuffix}-${file.originalname}`;

      // Check if file size exceeds the maximum allowed size
      if (file.size > maxImageUploadSize) {
        return callback(
          new Error('File size exceeds the maximum allowed size'),
          null,
        );
      }

      PrismaClient.myUploads
        .create({
          data: {
            user: {
              connect: { id: user.id },
            },
            fieldname: originalname,
            mimetype: mimetype,
            originalname: originalname,
            file_path: `/${coreConstant.FILE_DESTINATION}/${fileName}`,
            filename: fileName,
          },
        })
        .then((res) => {
          console.log(res, 'res');
        });

      return callback(null, fileName);
    },
  }),

  fileFilter: (request, file, callback) => {
    const mimetype = validImageUploadTypesRegex.test(file.mimetype);
    const extname = validImageUploadTypesRegex.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
      return callback(null, true);
    }

    return callback(new Error('Invalid file type'), false);
  },

  limits: {
    fileSize: maxImageUploadSize,
  },
};
const maxAudioUploadSize = 50 * 1024 * 1024; // Maximum file size (50MB) - adjust as needed
