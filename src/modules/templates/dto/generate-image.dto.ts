import { IsNotEmpty, IsString, IsIn } from 'class-validator';

const allowedImageSizes = ['512x512', '256x256', '1024x1024'];

export class GenerateImageDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(allowedImageSizes, {
    message:
      'Invalid image size. Allowed sizes are: 512x512, 256x256, 1024x1024',
  })
  image_size: '256x256' | '512x512' | '1024x1024';
}
