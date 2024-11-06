import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { SubscriptionGuard } from '../guards/Subscription.guard';

export const SUBSCRIPTION_KEY = 'subscriptionType';

export function Subscription(
  type:
    | 'text'
    | 'image'
    | 'code'
    | 'translation'
    | 'transcription'
    | 'csv'
    | 'chat_bot' = 'image',
) {
  return applyDecorators(
    SetMetadata(SUBSCRIPTION_KEY, type),
    UseGuards(SubscriptionGuard),
  );
}
