import { IsNotEmpty, IsString } from "class-validator";

export class UpdateGoogleAuthSettingsDto {
  @IsNotEmpty()
  @IsString()
  google_auth_client_id: string;

  @IsNotEmpty()
  @IsString()
  google_auth_client_secret: string;
}