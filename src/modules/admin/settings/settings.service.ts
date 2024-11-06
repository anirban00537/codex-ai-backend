import {
  addPhotoPrefix,
  adminSettingsValueBySlug,
  errorResponse,
  fetchMyUploadFilePathById,
  getAdminSettingsData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { UpdateGeneralSettingsDto } from './dto/update-general-settings.dt';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { updateSMTPSettingsDto } from './dto/update-smtp-settings.dt';
import { User } from '@prisma/client';
import {
  BraintreeCredentialsSlugs,
  CommonSettingsSlugs,
  CountryListObjectArray,
  GeneralSettingsSlugs,
  GithubAuthCredentialsSlugs,
  GoogleAuthCredentialsSlugs,
  LandingPageSlugs,
  OpenAISettingSlugs,
  OpenAISettingWithoutSecretSlugs,
  PaymentMethodPaystackSettingsSlugs,
  PaymentMethodRazorpaySettingsSlugs,
  PaymentMethodStripeSettingsSlugs,
  SMTPSettingsSlugs,
  TermsConditionSlugs,
} from 'src/shared/constants/array.constants';
import { UpdateTermsPrivacyDto } from './dto/update-terms-privacy.dt';
import { UpdateOpenAISettingsDto } from './dto/update-open-ai-settings.dt';
import { UpdatePaymentMethodStripeSettingsDto } from './dto/update-payment-stripe-settings.dt';
import { ResponseModel } from 'src/shared/models/response.model';
import { UpdateGoogleAuthSettingsDto } from './dto/update-google-auth-settings.dt';
import { coreConstant } from 'src/shared/helpers/coreConstant';
import { UpdateGithubAuthSettingsDto } from './dto/update-github-auth-settings.dto';
import { UpdateLandingPageDataDto } from './dto/update-landing-page-data.dto';
import { UpdateBraintreeSettingsData } from './dto/update-braintree-settings-data.dto';
import { UpdatePaymentMethodRazorpaySettingsDto } from './dto/update-payment-razorpay-settings.dto';
import { UpdatePaymentMethodPaystackSettingsDto } from './dto/update-payment-paystack-settings.dto';
import { MailerService } from 'src/shared/mail/mailer.service';

@Injectable()
export class SettingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailerService,
  ) {}

  async userListByCountryWise() {
    try {
      const userList = await this.prisma.user.groupBy({
        by: ['country'],
        _count: true,
      });

      userList;

      return successResponse('Country wise user list', userList);
    } catch (error) {
      processException(error);
    }
  }
  async getAllSettings() {
    try {
      const settings = await this.prisma.adminSettings.findMany();

      return settings;
    } catch (error) {
      processException(error);
    }
  }
  // update or create data
  async updateOrCreate(slugKey: any, values: any) {
    try {
      const payload = {
        value: String(values),
      };

      await this.prisma.adminSettings.upsert({
        where: { slug: slugKey },
        create: {
          // Data to insert if no matching record is found
          slug: slugKey, // Assuming slug is a required field
          value: payload.value, // Assuming payload contains the 'value' field
        },
        update: {
          // Data to update if a matching record is found
          value: payload.value, // Assuming payload contains the 'value' field
        },
      });
    } catch (error) {
      processException(error);
    }
  }
  async commonSettings() {
    try {
      const data = {};

      data['countryList'] = CountryListObjectArray;
      data['settings'] = await getAdminSettingsData(CommonSettingsSlugs);

      return successResponse('Common settings', data);
    } catch (error) {
      processException(error);
    }
  }
  async getAdminDashboardData() {
    try {
      const data = {};

      data['totalUsers'] = await this.prisma.user.count();

      const totalSaleResult = await this.prisma.paymentTransaction.aggregate({
        _sum: {
          price: true,
        },
      });

      if (
        totalSaleResult &&
        totalSaleResult._sum &&
        totalSaleResult._sum.price !== null
      ) {
        data['totalSale'] = totalSaleResult._sum.price.toNumber();
      } else {
        data['totalSale'] = 0; // Handle the case where data is missing
      }

      // Total Word and Image Generated
      const totalWordGenerated =
        await this.prisma.userPurchasedPackage.aggregate({
          _sum: {
            used_words: true,
            used_images: true,
          },
        });
      data['totalWordGenerated'] = totalWordGenerated._sum.used_words;
      data['totalImageGenerated'] = totalWordGenerated._sum.used_images;

      const rawData = await this.prisma.paymentTransaction.findMany({
        select: {
          created_at: true,
          price: true,
        },
      });

      const weeklySalesData = {
        Sunday: 0,
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
      };
      for (const entry of rawData) {
        const createdAt = entry.created_at;
        const weekName = createdAt.toLocaleDateString('en-US', {
          weekday: 'long',
        });

        weeklySalesData[weekName] += Number(entry.price);
      }
      data['weeklySalesData'] = weeklySalesData;

      data['packageAndSubscriptions'] = await this.prisma.package.findMany();

      const latestTransactionList =
        await this.prisma.paymentTransaction.findMany({
          take: 10,
          orderBy: {
            created_at: 'desc',
          },
          include: {
            User: {
              select: {
                last_name: true,
                photo: true,
              },
            },
            Package: {
              select: {
                name: true,
              },
            },
          },
        });

      latestTransactionList.map(function (query) {
        return (query.User.photo = query.User.photo
          ? addPhotoPrefix(query.User.photo)
          : null);
      });
      data['latest_transaction_list'] = latestTransactionList;
      data['user_count_by_country'] = await this.userListByCountryWise();

      const currentYear = new Date().getFullYear();
      const totalNewUsersThisYear = await this.prisma.user.count({
        where: {
          AND: [
            {
              created_at: {
                gte: new Date(currentYear, 0, 1),
              },
            },
            {
              created_at: {
                lte: new Date(currentYear, 11, 31, 23, 59, 59),
              },
            },
          ],
        },
      });
      data['totalNewUsersThisYear'] = totalNewUsersThisYear;
      const usersCountByMonth = await this.getUsersCountByMonth(currentYear);
      data['usersCountByMonth'] = usersCountByMonth;

      return successResponse('Admin dashboard data', data);
    } catch (error) {
      processException(error);
    }
  }
  async getRevenueCountByMonth(currentYear) {
    const revenueCountByMonth = {};
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0, 23, 59, 59);

      const revenueResult = await this.prisma.paymentTransaction.aggregate({
        _sum: {
          price: true,
        },
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      revenueCountByMonth[month] = revenueResult._sum.price.toNumber();
    }
    return revenueCountByMonth;
  }
  async getUsersCountByMonth(year) {
    const usersCountByMonth = {};

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      const count = await this.prisma.user.count({
        where: {
          AND: [
            {
              created_at: {
                gte: startDate,
                lte: endDate,
              },
            },
          ],
        },
      });

      const monthName = startDate.toLocaleString('en-US', { month: 'long' });

      usersCountByMonth[monthName] = count;
    }

    return usersCountByMonth;
  }
  async updateGeneralSettings(payload: UpdateGeneralSettingsDto) {
    try {
      const site_logo_path = payload.site_logo
        ? await fetchMyUploadFilePathById(payload.site_logo)
        : await adminSettingsValueBySlug('site_logo');
      const site_fav_icon_path = payload.site_fav_icon
        ? await fetchMyUploadFilePathById(payload.site_fav_icon)
        : await adminSettingsValueBySlug('site_fav_icon');

      const keyValuePairs = Object.entries(payload).map(([key, value]) => {
        if (key === 'site_logo') {
          value = site_logo_path;
        } else if (key === 'site_fav_icon') {
          value = site_fav_icon_path;
        }
        return { key, value };
      });

      await Promise.all(
        keyValuePairs.map((element) =>
          this.updateOrCreate(element.key, element.value),
        ),
      );

      const settings = await getAdminSettingsData(GeneralSettingsSlugs);
      return successResponse('Setting updated successfully', settings);
    } catch (error) {
      processException(error);
    }
  }

  async getGeneralSettingsData() {
    try {
      const slugs: any = GeneralSettingsSlugs;
      const data: any = await getAdminSettingsData(slugs);

      if (data.site_logo) data.site_logo = addPhotoPrefix(data.site_logo);
      if (data.site_fav_icon)
        data.site_fav_icon = addPhotoPrefix(data.site_fav_icon);
      return successResponse('General settings  data', data);
    } catch (error) {
      processException(error);
    }
  }
  async getOpenAiModels() {
    try {
      const model = [];
      coreConstant.OPEN_AI_MODEL_NAMES.map((item) => {
        model.push({
          label: item,
          value: item,
        });
      });
      return successResponse('Open Ai Models', model);
    } catch (error) {
      processException(error);
    }
  }
  async updateSMTPSettings(payload: updateSMTPSettingsDto) {
    try {
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const slugs: any = SMTPSettingsSlugs;
      const data = await getAdminSettingsData(slugs);

      return successResponse('SMTP settings is updated!', data);
    } catch (error) {
      processException(error);
    }
  }

  async getSMTPSettingsData() {
    try {
      const slugs: any = SMTPSettingsSlugs;
      const data = await getAdminSettingsData(slugs);

      return successResponse('SMTP settings data!', data);
    } catch (error) {
      processException(error);
    }
  }

  async sendTestMail(
    user: User,
    payload: {
      email: string;
    },
  ) {
    try {
      const response = this.mailService.sendMail(
        payload.email,
        'test',
        'test-mail.hbs',
      );
      return response;
      
    } catch (error) {
      processException(error);
    }
  }

  async updateTermsPrivacy(payload: UpdateTermsPrivacyDto) {
    try {
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const slugs: any = TermsConditionSlugs;
      const data = await getAdminSettingsData(slugs);

      return successResponse(
        'Privacy policy and Terms condition is updated successfully!',
        data,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getTermsPrivacyData() {
    try {
      const slugs: any = TermsConditionSlugs;
      const data = await getAdminSettingsData(slugs);

      return successResponse('Privacy policy and Terms condition data!', data);
    } catch (error) {
      processException(error);
    }
  }

  async updateOpenAISettings(payload: UpdateOpenAISettingsDto) {
    try {
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const data = await getAdminSettingsData(OpenAISettingWithoutSecretSlugs);

      return successResponse('Open AI settings is updated successfully!', data);
    } catch (error) {
      processException(error);
    }
  }

  async getOpenAiSettingsData() {
    try {
      const data = await getAdminSettingsData(OpenAISettingWithoutSecretSlugs);

      return successResponse('Open AI settings data!', data);
    } catch (error) {
      processException(error);
    }
  }

  async updatePaymentStripeSettings(
    payload: UpdatePaymentMethodStripeSettingsDto,
  ) {
    try {
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const data = await getAdminSettingsData(PaymentMethodStripeSettingsSlugs);

      return successResponse(
        'Stripe payment method settings is updated successfully!',
        data,
      );
    } catch (error) {
      processException(error);
    }
  }
  async updatePaymentRazorpaySettings(
    payload: UpdatePaymentMethodRazorpaySettingsDto,
  ) {
    try {
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const data = await getAdminSettingsData(
        PaymentMethodRazorpaySettingsSlugs,
      );

      return successResponse(
        'Razorpay payment method settings is updated successfully!',
        data,
      );
    } catch (error) {
      processException(error);
    }
  }
  async getPaymentMethodRazorpaySettingsData() {
    try {
      const data = await getAdminSettingsData(
        PaymentMethodRazorpaySettingsSlugs,
      );

      return successResponse('Stripe payment method settings data!', data);
    } catch (error) {
      processException(error);
    }
  }
  async updatePaymentPaystackSettings(
    payload: UpdatePaymentMethodPaystackSettingsDto,
  ) {
    try {
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const data = await getAdminSettingsData(
        PaymentMethodPaystackSettingsSlugs,
      );

      return successResponse(
        'Paystack payment method settings is updated successfully!',
        data,
      );
    } catch (error) {
      processException(error);
    }
  }
  async getPaymentMethodPaystackSettingsData() {
    try {
      const data = await getAdminSettingsData(
        PaymentMethodPaystackSettingsSlugs,
      );

      return successResponse('Paystack payment method settings data!', data);
    } catch (error) {
      processException(error);
    }
  }
  async getPaymentMethodStripeSettingsData() {
    try {
      const data = await getAdminSettingsData(PaymentMethodStripeSettingsSlugs);

      return successResponse('Stripe payment method settings data!', data);
    } catch (error) {
      processException(error);
    }
  }

  async updateGoogleAuthSettings(payload: UpdateGoogleAuthSettingsDto) {
    try {
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const data = await getAdminSettingsData(GoogleAuthCredentialsSlugs);

      return successResponse(
        'Google auth credentials is update successfully!',
        data,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getGoogleAuthSettingsData() {
    try {
      const data = await getAdminSettingsData(GoogleAuthCredentialsSlugs);

      return successResponse('Google auth credentials', data);
    } catch (error) {
      processException(error);
    }
  }

  async updateGithubAuthSettings(payload: UpdateGithubAuthSettingsDto) {
    try {
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const data = await getAdminSettingsData(GithubAuthCredentialsSlugs);

      return successResponse(
        'Github auth credentials is update successfully!',
        data,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getGithubAuthSettingsData() {
    try {
      const data = await getAdminSettingsData(GithubAuthCredentialsSlugs);

      return successResponse('Github auth credentials', data);
    } catch (error) {
      processException(error);
    }
  }

  async updateLandingPageData(payload: UpdateLandingPageDataDto) {
    try {
      const landing_page_first_img_url = payload.landing_page_first_img_url
        ? await fetchMyUploadFilePathById(payload.landing_page_first_img_url)
        : await adminSettingsValueBySlug('landing_page_first_img_url');

      const landing_page_logo_url = payload.landing_page_logo_url
        ? await fetchMyUploadFilePathById(payload.landing_page_logo_url)
        : await adminSettingsValueBySlug('landing_page_logo_url');

      const keyValuePairs = Object.entries(payload).map(([key, value]) => {
        if (key === 'landing_page_first_img_url') {
          value = landing_page_first_img_url;
        }
        if (key === 'landing_page_logo_url') {
          value = landing_page_logo_url;
        }
        return { key, value };
      });

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const data = await getAdminSettingsData(LandingPageSlugs);

      return successResponse(
        'Landing page data is updated successfully!',
        data,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getLlandingPageData() {
    try {
      const data: any = await getAdminSettingsData(LandingPageSlugs);
      data.landing_page_first_img_url = addPhotoPrefix(
        data.landing_page_first_img_url,
      );
      data.landing_page_logo_url = addPhotoPrefix(data.landing_page_logo_url);

      return successResponse('Landing page data!', data);
    } catch (error) {
      processException(error);
    }
  }

  async updateBraintreeSettingsData(payload: UpdateBraintreeSettingsData) {
    try {
      const keyValuePairs = Object.keys(payload).map((key) => ({
        key,
        value: payload[key],
      }));

      await Promise.all(
        keyValuePairs.map(async (element) => {
          await this.updateOrCreate(element.key, element.value);
        }),
      );

      const data = await getAdminSettingsData(BraintreeCredentialsSlugs);

      return successResponse(
        'Braintree credentials is update successfully!',
        data,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getBraintreeSettingsData() {
    try {
      const data = await getAdminSettingsData(BraintreeCredentialsSlugs);

      return successResponse('Braintree credentials credentials', data);
    } catch (error) {
      processException(error);
    }
  }
}
