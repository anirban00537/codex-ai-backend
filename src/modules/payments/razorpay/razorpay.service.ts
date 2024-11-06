import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import { PaymentMethodRazorpaySettingsSlugs } from 'src/shared/constants/array.constants';
import { getAdminSettingsData } from 'src/shared/helpers/functions';
@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;
  constructor() {}
  async init() {
    const data: any = await getAdminSettingsData(
      PaymentMethodRazorpaySettingsSlugs,
    );
    if (!data.key_id && !data.key_secret) {
      return;
    }
    this.razorpay = new Razorpay({
      key_id: data.key_id,
      key_secret: data.key_secret,
    });
  }
  async createOrder(amount: number, currency: string, receipt: string) {
    const options = {
      amount,
      currency,
      receipt,
      payment_capture: 1,
    };

    try {
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw new Error('Error creating Razorpay order');
    }
  }
  async capturePayment(orderId: string, amount: number, currency: string) {
    try {
      const payment = await this.razorpay.payments.capture(
        orderId,
        amount,
        currency,
      );
      return payment;
    } catch (error) {
      throw new Error('Error capturing payment');
    }
  }
  private async retrieveOrder(orderId: string): Promise<any> {
    const order = await this.razorpay.orders.fetch(orderId);
    return order;
  }
  async verifyPayment(orderId: string): Promise<boolean> {
    try {
      const payment = await this.retrieveOrder(orderId);
      if (payment && payment.status === 'captured') {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false; // An error occurred during verification
    }
  }
}
