import axios, { AxiosResponse } from 'axios';
import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { PaymentMethodPaystackSettingsSlugs } from 'src/shared/constants/array.constants';
import {
  getAdminSettingsData,
  processException,
} from 'src/shared/helpers/functions';

@Injectable()
export class PayStackService {
  private readonly payStackApiUrl = 'https://api.paystack.co';

  async getBalance(): Promise<AxiosResponse<any>> {
    const url = `${this.payStackApiUrl}/balance`;
    return axios.get(url);
  }

  async verifyPayment(reference: string): Promise<AxiosResponse<any>> {
    try {
      const credential: any = await getAdminSettingsData(
        PaymentMethodPaystackSettingsSlugs,
      );
      const key_secret = credential.key_secret;
      const headers = {
        Authorization: `Bearer ${key_secret}`,
        'Content-Type': 'application/json',
      };
      const url = `${this.payStackApiUrl}/transaction/verify/${reference}`;
      const response = await axios.get(url, { headers });
      return response?.data;
    } catch (error) {
      throw new ForbiddenException('invalid referance!');
    }
  }

  async initiatePayment(
    amount: number,
    email: string,
    reference: string,
    type: string,
  ): Promise<any> {
    try {
      const credential: any = await getAdminSettingsData(
        PaymentMethodPaystackSettingsSlugs,
      );

      const public_key = credential.public_key;
      const key_secret = credential.key_secret;

      const url = `${this.payStackApiUrl}/transaction/initialize`;
      const data = {
        amount,
        email,
        reference: `${Math.floor(
          Math.random() * 1000000000 + 1,
        )}_${type}_${reference}`,
        callback_url: credential.redirect_url
          ? credential.redirect_url
          : 'http://localhost:3001/upgrade',
      };

      const headers = {
        Authorization: `Bearer ${key_secret}`,
        'Content-Type': 'application/json',
      };

      const response = await axios.post(url, data, { headers });

      return response.data;
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  }
}
