import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { GoogleAuthConfig, MailConfig } from 'src/shared/configs/config.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<GoogleAuthConfig>('client_id'),
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/api/auth/google/callback',
      scope: ['profile', 'email'],
    });
    
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user = {
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      first_name: name.givenName,
      last_name: name.familyName,
      name: `${name.givenName} ${name.familyName}`,
      picture: photos[0].value,
    };
    done(null, user);
  }
}
