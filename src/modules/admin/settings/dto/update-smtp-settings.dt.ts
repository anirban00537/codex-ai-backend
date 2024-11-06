import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class updateSMTPSettingsDto {
  @IsNotEmpty()
  @IsString()
  mail_driver: string;

  @IsNotEmpty()
  @IsString()
  smtp_host: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  smtp_port: number;

  @IsNotEmpty()
  @IsString()
  smtp_user_name: string;

  @IsNotEmpty()
  @IsString()
  smtp_password: string;

  @IsNotEmpty()
  @IsString()
  smtp_sender_email: string;

  @IsNotEmpty()
  @IsString()
  smtp_sender_name: string;

  @IsNotEmpty()
  @IsString()
  smtp_encryption: string;
}
