import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { PaymentsService } from 'src/modules/payments/payments.service';
import { coreConstant } from '../helpers/coreConstant';
import { getAdminSettingsData } from '../helpers/functions';
import { OpenAISettingSlugs } from '../constants/array.constants';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const response: any = await getAdminSettingsData(OpenAISettingSlugs);
    if (!response.open_ai_secret) {
      throw new ForbiddenException(
        'Admin has not set the settings for open ai!',
      );
    }
    const type =
      this.reflector.get<string>('subscriptionType', context.getHandler()) ||
      'image';

    const {
      package_valid,
      image_limit_exceed,
      word_limit_exceed,
      package: myPackage,
    }: any = await this.paymentsService.getUserPackage(user);
    if (!package_valid) {
      throw new ForbiddenException('Your package is not valid.');
    }
    const available_features = myPackage.available_features
      .split(',')
      .map(Number);

    if (type === 'text') {
      if (word_limit_exceed) {
        throw new ForbiddenException('Text limit exceeded.');
      }
      if (
        !available_features.includes(
          coreConstant.AVAILABLE_FEATURES.CONTENT_WRITING,
        )
      ) {
        throw new ForbiddenException(
          'Content writing feature is not available for your package.',
        );
      }
    }
    if (type === 'code') {
      if (word_limit_exceed) {
        throw new ForbiddenException('Word limit exceeded.');
      }
      if (!available_features.includes(coreConstant.AVAILABLE_FEATURES.CODE)) {
        throw new ForbiddenException(
          'Ai code feature is not available for your package.',
        );
      }
    }
    if (type === 'transcription') {
      if (word_limit_exceed) {
        throw new ForbiddenException('Word limit exceeded.');
      }
      if (
        !available_features.includes(
          coreConstant.AVAILABLE_FEATURES.TRANSCRIPTION,
        )
      ) {
        throw new ForbiddenException(
          'Ai speech to text feature is not available for your package.',
        );
      }
    }
    if (type === 'csv') {
      if (word_limit_exceed) {
        throw new ForbiddenException('Word limit exceeded.');
      }
      if (
        !available_features.includes(
          coreConstant.AVAILABLE_FEATURES.TOPIC_TO_SPREDSHEET_GENERATOR,
        )
      ) {
        throw new ForbiddenException(
          'Ai spreadsheet generator feature is not available for your package.',
        );
      }
    }
    if (type === 'translation') {
      if (word_limit_exceed) {
        throw new ForbiddenException('Word limit exceeded.');
      }
      if (
        !available_features.includes(
          coreConstant.AVAILABLE_FEATURES.TRANSLATION,
        )
      ) {
        throw new ForbiddenException(
          'Ai Translation feature is not available for your package.',
        );
      }
    }
    if (type === 'image') {
      if (image_limit_exceed) {
        throw new ForbiddenException('Image limit exceeded.');
      }
      if (
        !available_features.includes(
          coreConstant.AVAILABLE_FEATURES.IMAGE_GENERATION,
        )
      ) {
        throw new ForbiddenException(
          'Image generation feature is not available for your package.',
        );
      }
    }

    if (type === 'chat_bot') {
      if (word_limit_exceed) {
        throw new ForbiddenException('Word limit exceeded.');
      }
      if (
        !available_features.includes(coreConstant.AVAILABLE_FEATURES.CHAT_BOT)
      ) {
        throw new ForbiddenException(
          'Ai chat bot feature is not available for your package.',
        );
      }
    }

    return true;
  }
}
