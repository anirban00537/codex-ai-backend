import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { getAdminSettingsData } from 'src/shared/helpers/functions';
import { PaymentMethodStripeSettingsSlugs } from 'src/shared/constants/array.constants';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {}

  async init() {
    const response: any = await getAdminSettingsData(
      PaymentMethodStripeSettingsSlugs,
    );
    this.stripe = new Stripe(response?.pm_stripe_secret_key_live, {
      apiVersion: '2023-08-16', // Replace with the desired Stripe API version
    });
  }

  async createStripePaymentIntent(
    amount: number,
    currency: string = 'USD',
  ): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized');
      return;
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: currency,
    });

    return paymentIntent;
  }
  async verifyPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      return;
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId,
    );

    // Check if the payment is successful
    if (paymentIntent.status === 'succeeded') {
      return paymentIntent;
    } else {
      throw new Error('Payment not successful');
    }
  }
}
