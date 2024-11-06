import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateGithubAuthSettingsDto {
  @IsNotEmpty()
  @IsString()
  github_auth_client_id: string;

  @IsNotEmpty()
  @IsString()
  github_auth_client_secret: string;
}
