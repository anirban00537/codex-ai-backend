import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { Public } from 'src/shared/decorators/public.decorator';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { User } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';
import { createIntentDto } from './dto/create-intent.dto';
import { paginateType } from './dto/query.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  @Public()
  @Get('get-all-packages')
  getAllPackages(
    @Query()
    payload: any,
  ): Promise<ResponseModel> {
    return this.paymentsService.getAllSubcriptionPackages(payload);
  }
  @IsAdmin()
  @Get('admin-get-all-packages')
  getAllPackagesAdmin(
    @Query()
    payload: paginateType,
  ): Promise<ResponseModel> {
    return this.paymentsService.getAllPackagesAdmin(payload);
  }
  @Get('check-subscription-status')
  checkSubscriptionStatus(@UserInfo() user: User): Promise<ResponseModel> {
    return this.paymentsService.checkSubscriptionStatus(user);
  }

  @IsAdmin()
  @Post('create-package')
  createPackage(@Body() packageInfo: CreatePaymentDto): Promise<ResponseModel> {
    return this.paymentsService.createPackageService(packageInfo);
  }

  @IsAdmin()
  @Delete('delete-package/:id')
  deletePackage(@Param('id') id: string): Promise<ResponseModel> {
    return this.paymentsService.deletePackage(id);
  }
  @IsAdmin()
  @Get('get-package-details/:id')
  getPackageDetails(@Param('id') id: string): Promise<ResponseModel> {
    return this.paymentsService.getPackageDetails(id);
  }

  @IsAdmin()
  @Post('update-package')
  updatePackage(
    @Body() updatedPackageInfo: UpdatePaymentDto,
  ): Promise<ResponseModel> {
    return this.paymentsService.updatePackageService(updatedPackageInfo);
  }

  @Post('create-stripe-intent')
  createStripePaymentIntent(
    @Body() payload: createIntentDto,
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.paymentsService.createStripePaymentIntent(payload.amount, user);
  }
  @Post('confirm-and-verify-stripe-payment')
  verifyPaymentIntent(
    @Body()
    payload: {
      payment_intent_id: string;
      subcription_package_Id: string;
    },
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.paymentsService.verifyPaymentIntent(
      payload.payment_intent_id,
      payload.subcription_package_Id,
      user,
    );
  }

  @IsAdmin()
  @Get('get-openai-model-names')
  getOpenAIModelNames(): Promise<ResponseModel> {
    return this.paymentsService.getOpenAIModelNames();
  }

  @IsAdmin()
  @Post('price-suggestion')
  suggestPricing(
    @Body()
    payload: {
      model_name: string;
      images: number;
      words: number;
    },
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.paymentsService.suggestPricing(
      payload.model_name,
      payload.images,
      payload.words,
    );
  }

  @Post('subscribe')
  subscribeToPackage(
    @UserInfo() user: User,
    @Body()
    payload: {
      subcription_package_Id: string;
    },
  ): Promise<ResponseModel> {
    return this.paymentsService.subscribeToSubcriptionPackage(
      user,
      payload.subcription_package_Id,
    );
  }

  @Post('add-package-to-subscription')
  addPackageToSubscription(
    @UserInfo() user: User,
    @Body()
    payload: {
      packageId: string;
      payment_intent_id: string;
    },
  ): Promise<ResponseModel> {
    return this.paymentsService.addPackageToSubscription(
      user,
      payload.packageId,
      payload.payment_intent_id,
    );
  }
  // getAllTransaction;
  @IsAdmin()
  @Get('get-all-transaction')
  getAllTransaction(
    @Query()
    payload: any,
  ): Promise<ResponseModel> {
    return this.paymentsService.getAllTransaction(payload);
  }
  @Get('create-braintree-client-token')
  createBraintreeClientToken(): Promise<ResponseModel> {
    return this.paymentsService.createBraintreeClientToken();
  }
  @Post('subscribe-braintree')
  processBraintreePaymentTransaction(
    @Body('amount') amount: number,
    @Body('payment_method_nonce') payment_method_nonce: string,
    @UserInfo() user: User,
    @Body('packageId') packageId: string,
  ): Promise<ResponseModel> {
    return this.paymentsService.processBraintreePaymentTransaction(
      amount,
      payment_method_nonce,
      packageId,
      user,
    );
  }
  @Post('add-package-to-subscription-braintree')
  addPackageToSubscriptionBraintree(
    @Body('amount') amount: number,
    @Body('payment_method_nonce') payment_method_nonce: string,
    @UserInfo() user: User,
    @Body('packageId') packageId: string,
  ): Promise<ResponseModel> {
    return this.paymentsService.addPackageToSubscriptionBraintree(
      amount,
      payment_method_nonce,
      packageId,
      user,
    );
  }

  @Get('get-my-transaction-list')
  getMyTransactionList(@UserInfo() user: User, @Query() payload: any) {
    return this.paymentsService.getMyTransactionList(user, payload);
  }
  @Post('razorpay-create-order')
  razorpayCreateOrder(
    @Body('amount') amount: number,
    @UserInfo() user: User,
    @Body('packageId') packageId: string,
  ): Promise<ResponseModel> {
    return this.paymentsService.razorpayCreateOrder(amount, packageId, user);
  }
  @Post('razorpay-capture-subscribe')
  capturePayment(
    @UserInfo() user: User,
    @Body('packageId') packageId: string,
    @Body('orderId') orderId: string,
  ): Promise<ResponseModel> {
    return this.paymentsService.razorpaycapturePayment(
      orderId,
      user,
      packageId,
    );
  }
  @Post('razorpay-capture-package-to-subscription')
  razorPaysubscription(
    @UserInfo() user: User,
    @Body('packageId') packageId: string,
    @Body('orderId') orderId: string,
  ): Promise<ResponseModel> {
    return this.paymentsService.razorPaysubscription(orderId, user, packageId);
  }
  @Post('paystack-create-payment')
  payStackCreatePayment(
    @Body('amount') amount: number,
    @UserInfo() user: User,
    @Body('packageId') packageId: string,
    @Body('type') type: string,
  ): Promise<ResponseModel> {
    return this.paymentsService.payStackCreatePayment(
      amount,
      packageId,
      user,
      type,
    );
  }
  @Post('paystack-capture-subscribe')
  paystackcapturePayment(
    @UserInfo() user: User,
    @Body('packageId') packageId: string,
    @Body('referance') referance: string,
  ): Promise<ResponseModel> {
    return this.paymentsService.paystackSubscription(
      referance,
      user,
      packageId,
    );
  }
  @Post('paystack-capture-package-to-subscription')
  paystackSubscription(
    @UserInfo() user: User,
    @Body('packageId') packageId: string,
    @Body('referance') referance: string,
  ): Promise<ResponseModel> {
    return this.paymentsService.paystackAddPackage(referance, user, packageId);
  }
  ;
}
