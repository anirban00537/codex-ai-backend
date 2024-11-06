import { Injectable, NotFoundException } from '@nestjs/common';
import { getAdminSettingsData } from 'src/shared/helpers/functions';
import { BraintreeCredentialsSlugs } from 'src/shared/constants/array.constants';
import * as braintree from 'braintree';

@Injectable()
export class BraintreeService {
  private gateway: braintree.BraintreeGateway;

  constructor() {}

  async init() {
    const response: any = await getAdminSettingsData(BraintreeCredentialsSlugs);

    let braintree_public_key = response.braintree_public_key;
    let braintree_merchant_id = response.braintree_merchant_id;
    let braintree_private_key = response.braintree_private_key;
    this.gateway = new braintree.BraintreeGateway({
      environment: braintree.Environment.Sandbox,
      merchantId: braintree_merchant_id,
      publicKey: braintree_public_key,
      privateKey: braintree_private_key,
    });
  }
  async getClientToken(): Promise<string> {
    try {
      await this.init();
      if (!this.gateway) {
        throw new NotFoundException(
          'Braintree gateway is not initialized. Call init() first.',
        );
      }

      const { clientToken } = await this.gateway.clientToken.generate({});
      return clientToken;
    } catch (error) {
      console.error('Braintree Error:', error);
    }
  }

  async createTransaction(
    amount: number,
    paymentMethodNonce: string,
  ): Promise<braintree.Transaction> {
    await this.init();
    if (!this.gateway) {
      throw new NotFoundException(
        'Braintree gateway is not initialized. Call init() first.',
      );
    }

    return new Promise((resolve, reject) => {
      this.gateway.transaction.sale(
        {
          amount: amount.toFixed(2),
          paymentMethodNonce,
          options: { submitForSettlement: true },
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.transaction);
          }
        },
      );
    });
  }
}
