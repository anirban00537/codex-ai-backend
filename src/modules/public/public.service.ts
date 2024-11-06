import { Injectable } from '@nestjs/common';
import {
  CommonSettingsSlugs,
  CountryListObjectArray,
  LanguageListJsonArray,
} from 'src/shared/constants/array.constants';
import {
  PrismaClient,
  addPhotoPrefix,
  getAdminSettingsData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { TrustedOrganizationService } from '../admin/trusted-organization/trusted.service';
import { SettingService } from '../admin/settings/settings.service';
import { ReviewService } from '../review/review.service';
import { PaymentsService } from '../payments/payments.service';
import { FeatureAiService } from '../feature-ai/feature-ai.service';
import { faqTypeConstant } from 'src/shared/helpers/coreConstant';
import { SocialMediaService } from '../social-media/social-media.service';

@Injectable()
export class PublicService {
  constructor(
    private readonly trustedOrganizationService: TrustedOrganizationService,
    private readonly settingService: SettingService,
    private readonly reviewService: ReviewService,
    private readonly paymentService: PaymentsService,
    private readonly featureService: FeatureAiService,
    private readonly socialMediaService: SocialMediaService,
  ) {}
  async getAllLanguageList() {
    const languageList = LanguageListJsonArray;
    return successResponse('Language list', languageList);
  }

  async commonSettings() {
    try {
      const data = {};
      // site_logo;
      data['settings'] = await getAdminSettingsData(CommonSettingsSlugs);
      if (data['settings']?.site_logo) {
        data['settings'].site_logo = addPhotoPrefix(
          data['settings']?.site_logo,
        );
      }
      if (data['settings']?.site_fav_icon) {
        data['settings'].site_fav_icon = addPhotoPrefix(
          data['settings']?.site_fav_icon,
        );
      }
      data['countryList'] = CountryListObjectArray;
      data['language_list'] = LanguageListJsonArray;
      const socialMediaList =
        await this.socialMediaService.getAllActiveSocialMedia();

      data['social_media_list'] = socialMediaList.data;
      return successResponse('Common settings', data);
    } catch (error) {
      processException(error);
    }
  }

  async getLandingPageData() {
    try {
      const data = {};
      const trustedOrganizations =
        await this.trustedOrganizationService.getAllTrustedOrganization();

      const landinPageData = await this.settingService.getLlandingPageData();

      const reviewList = await this.reviewService.getActiveReviewList();

      const packageList =
        await this.paymentService.getAllActiveSubscriptionPackage();

      const featureOfAiList =
        await this.featureService.getActiveFeatureOfAiList();
      data['faq'] = await PrismaClient.faq.findMany({
        where: {
          type: faqTypeConstant.LANDING_PAGE,
        },
      });
      data['landing_data'] = landinPageData.data;
      data['trusted_organizations'] = trustedOrganizations.data;
      data['review_list'] = reviewList.data;
      data['package_list'] = packageList.data;
      data['feature_of_ai'] = featureOfAiList.data;

      return successResponse('Landing page data', data);
    } catch (error) {
      processException(error);
    }
  }
}
