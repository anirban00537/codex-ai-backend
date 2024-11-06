import { PartialType } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  isNotEmpty,
  isPhoneNumber,
  isString,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Type } from 'class-transformer';

/** Describes the User fields that are updatable
 *
 * <br>Note that since this is a
 * <u>Partial of <a href="CreateUserDto.html">CreateUserDto</a></u>,
 * any field there is optional here
 */
export class UpdateUserDto {
  /**
   * User current password
   * @example "abc123456"
   */
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birth_date: Date;

  @IsNotEmpty()
  @IsNumber()
  gender: number;

  @IsOptional()
  @IsNumber()
  file_id: number;
}
