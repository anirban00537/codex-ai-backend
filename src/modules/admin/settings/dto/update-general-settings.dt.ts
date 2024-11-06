import { AdminSettings } from '@prisma/client';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { coreConstant } from 'src/shared/helpers/coreConstant';

export class UpdateGeneralSettingsDto {
  @IsNotEmpty()
  @IsString()
  site_name: string;

  @IsNotEmpty()
  @IsString()
  site_url: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  site_email: string;

  @IsNotEmpty()
  @IsString()
  site_copy_right_text: string;

  @IsNotEmpty()
  @IsString()
  default_country: string;

  @IsNotEmpty()
  @IsNumber()
  @IsIn([coreConstant.STATUS_ACTIVE, coreConstant.STATUS_INACTIVE])
  social_login_github_status: number;

  @IsNotEmpty()
  @IsNumber()
  @IsIn([coreConstant.STATUS_ACTIVE, coreConstant.STATUS_INACTIVE])
  social_login_google_status: number;

  @IsOptional()
  @IsString()
  google_analytics_tracking_id: string;

  @IsOptional()
  @IsString()
  meta_title: string;

  @IsOptional()
  @IsString()
  meta_description: string;

  @IsOptional()
  @IsString()
  meta_keywords: string;

  @IsOptional()
  @IsNumber()
  site_logo: number;

  @IsOptional()
  @IsNumber()
  site_fav_icon: number;
}
