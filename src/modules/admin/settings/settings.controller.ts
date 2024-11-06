import { Body, Controller, Get, Post } from '@nestjs/common';
import { SettingService } from './settings.service';
import { ResponseModel } from 'src/shared/models/response.model';
import { UpdateGeneralSettingsDto } from './dto/update-general-settings.dt';
import { updateSMTPSettingsDto } from './dto/update-smtp-settings.dt';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { User } from '@prisma/client';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { UpdateTermsPrivacyDto } from './dto/update-terms-privacy.dt';
import { UpdateOpenAISettingsDto } from './dto/update-open-ai-settings.dt';
import { UpdatePaymentMethodStripeSettingsDto } from './dto/update-payment-stripe-settings.dt';
import { UpdateGoogleAuthSettingsDto } from './dto/update-google-auth-settings.dt';
import { UpdateGithubAuthSettingsDto } from './dto/update-github-auth-settings.dto';
import { UpdateLandingPageDataDto } from './dto/update-landing-page-data.dto';
import { UpdateBraintreeSettingsData } from './dto/update-braintree-settings-data.dto';
import { UpdatePaymentMethodRazorpaySettingsDto } from './dto/update-payment-razorpay-settings.dto';
import { UpdatePaymentMethodPaystackSettingsDto } from './dto/update-payment-paystack-settings.dto';

@IsAdmin()
@Controller('admin-settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}
  @Get('get-terms-privacy-data')
  getTermsPrivacyData(): Promise<ResponseModel> {
    return this.settingService.getTermsPrivacyData();
  }
  @Get('get-admin-dashboard-data')
  getAdminDashboardData(): Promise<ResponseModel> {
    return this.settingService.getAdminDashboardData();
  }
  @Get('common-settings')
  commonSettings(): Promise<ResponseModel> {
    return this.settingService.commonSettings();
  }

  @Post('update-general-settings')
  updateGeneralSettings(
    @Body() payload: UpdateGeneralSettingsDto,
  ): Promise<ResponseModel> {
    return this.settingService.updateGeneralSettings(payload);
  }

  @Get('general-settings-data')
  getGeneralSettingsData(): Promise<ResponseModel> {
    return this.settingService.getGeneralSettingsData();
  }
  @Get('get-openai-models')
  getOpenAiModels(): Promise<ResponseModel> {
    return this.settingService.getOpenAiModels();
  }
  @Post('update-smtp-settings')
  updateSMTPSettings(
    @Body() payload: updateSMTPSettingsDto,
  ): Promise<ResponseModel> {
    return this.settingService.updateSMTPSettings(payload);
  }

  @Get('smtp-settings-data')
  getSMTPSettingsData(): Promise<ResponseModel> {
    return this.settingService.getSMTPSettingsData();
  }

  @Post('test-mail')
  sendTestMail(
    @UserInfo() user: User,
    @Body()
    payload: {
      email: string;
    },
  ) {
    return this.settingService.sendTestMail(user, payload);
  }

  @Post('update-terms-privacy')
  updateTermsPrivacy(
    @Body() payload: UpdateTermsPrivacyDto,
  ): Promise<ResponseModel> {
    return this.settingService.updateTermsPrivacy(payload);
  }

  @Post('update-open-ai-settings')
  updateOpenAISettings(@Body() payload: UpdateOpenAISettingsDto) {
    return this.settingService.updateOpenAISettings(payload);
  }

  @Get('get-open-ai-settings-data')
  getOpenAiSettingsData(): Promise<ResponseModel> {
    return this.settingService.getOpenAiSettingsData();
  }

  @Post('update-payment-stripe-settings')
  updatePaymentStripeSettings(
    @Body() payload: UpdatePaymentMethodStripeSettingsDto,
  ) {
    return this.settingService.updatePaymentStripeSettings(payload);
  }
  @Post('update-payment-razorpay-settings')
  updatePaymentRazorpaySettings(
    @Body() payload: UpdatePaymentMethodRazorpaySettingsDto,
  ) {
    return this.settingService.updatePaymentRazorpaySettings(payload);
  }
  @Get('get-payment-razorpay-settings-data')
  getPaymentMethodRazorpaySettingsData(): Promise<ResponseModel> {
    return this.settingService.getPaymentMethodRazorpaySettingsData();
  }
  @Post('update-payment-paystack-settings')
  updatePaymentpaystackSettings(
    @Body() payload: UpdatePaymentMethodPaystackSettingsDto,
  ) {
    return this.settingService.updatePaymentPaystackSettings(payload);
  }
  @Get('get-payment-paystack-settings-data')
  getPaymentMethodpaystackSettingsData(): Promise<ResponseModel> {
    return this.settingService.getPaymentMethodPaystackSettingsData();
  }
  @Get('get-payment-stripe-settings-data')
  getPaymentMethodStripeSettingsData(): Promise<ResponseModel> {
    return this.settingService.getPaymentMethodStripeSettingsData();
  }

  @Post('update-google-auth-settings')
  updateGoogleAuthSettings(@Body() payload: UpdateGoogleAuthSettingsDto) {
    return this.settingService.updateGoogleAuthSettings(payload);
  }

  @Get('get-google-auth-settings-data')
  getGoogleAuthSettingsData() {
    return this.settingService.getGoogleAuthSettingsData();
  }

  @Post('update-github-auth-settings')
  updateGithubAuthSettings(@Body() payload: UpdateGithubAuthSettingsDto) {
    return this.settingService.updateGithubAuthSettings(payload);
  }

  @Get('get-github-auth-settings-data')
  getGithubAuthSettingsData() {
    return this.settingService.getGithubAuthSettingsData();
  }

  @Post('update-landing-page-data')
  updateLandingPageData(@Body() payload: UpdateLandingPageDataDto) {
    return this.settingService.updateLandingPageData(payload);
  }

  @Get('get-landing-page-data')
  getLlandingPageData() {
    return this.settingService.getLlandingPageData();
  }

  @Post('update-braintree-settings-data')
  updateBraintreeSettingsData(@Body() payload: UpdateBraintreeSettingsData) {
    return this.settingService.updateBraintreeSettingsData(payload);
  }

  @Get('get-braintree-settings-data')
  getBraintreeSettingsData() {
    return this.settingService.getBraintreeSettingsData();
  }
}
