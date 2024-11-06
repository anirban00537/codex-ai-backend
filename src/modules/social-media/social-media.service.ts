import { Injectable } from '@nestjs/common';
import {
  addPhotoPrefix,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { CreateNewSocialMediaDto } from './dto/create-new-social-media.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  DefaultPaginationMetaData,
  coreConstant,
} from 'src/shared/helpers/coreConstant';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';

@Injectable()
export class SocialMediaService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewSocialMedia(payload: CreateNewSocialMediaDto) {
    try {
      let image_url = null;
      if (payload.file_id) {
        const fileDetails = await this.prisma.myUploads.findFirst({
          where: {
            id: payload.file_id,
          },
        });

        if (!fileDetails) {
          return errorResponse('Invalid image request!');
        }

        image_url = fileDetails.file_path;
      }
      const newSocialMedia = await this.prisma.socialMedia.create({
        data: {
          name: payload.name,
          status: payload.status,
          link: payload.link,
          image_url: image_url,
        },
      });
      return successResponse(
        'New Social Media is addedd successfully!',
        newSocialMedia,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getSocialMediaListForAdmin(payload: any) {
    try {
      const data = {};
      const whereClause = payload.search
        ? {
            name: {
              contains: payload.search,
            },
          }
        : {};
      if (payload.limit || payload.offset) {
        const paginate = await paginatioOptions(payload);

        const socialMediaList = await this.prisma.socialMedia.findMany({
          where: whereClause,
          ...paginate,
        });

        const paginationMeta =
          socialMediaList.length > 0
            ? await paginationMetaData('socialMedia', payload, whereClause)
            : DefaultPaginationMetaData;

        data['list'] = socialMediaList;
        data['meta'] = paginationMeta;
      } else {
        const socialMediaList = await this.prisma.socialMedia.findMany({
          where: whereClause,
        });

        data['list'] = socialMediaList;
      }
      data['list'].map(function (query) {
        return (query.image_url = addPhotoPrefix(query.image_url));
      });
      return successResponse('Social Media List data', data);
    } catch (error) {
      processException(error);
    }
  }

  async getSocialMediaDetails(id: number) {
    try {
      const socialMediaDetails = await this.prisma.socialMedia.findFirst({
        where: {
          id: id,
        },
      });
      if (!socialMediaDetails) {
        return errorResponse('Invalid request');
      }

      socialMediaDetails.image_url = addPhotoPrefix(
        socialMediaDetails.image_url,
      );
      return successResponse('Social Media details', socialMediaDetails);
    } catch (error) {
      processException(error);
    }
  }

  async updateSocialMedia(payload: UpdateSocialMediaDto) {
    try {
      let image_url = null;
      if (payload.file_id) {
        const fileDetails = await this.prisma.myUploads.findFirst({
          where: {
            id: payload.file_id,
          },
        });

        if (!fileDetails) {
          return errorResponse('Invalid image request!');
        }

        image_url = fileDetails.file_path;
      }

      const socialMediaDetails = await this.prisma.socialMedia.findFirst({
        where: {
          id: payload.id,
        },
      });

      if (!socialMediaDetails) {
        return errorResponse('Invalid request!');
      }

      const updateSocialMedia = await this.prisma.socialMedia.update({
        where: {
          id: socialMediaDetails.id,
        },
        data: {
          name: payload.name,
          status: payload.status,
          image_url: image_url ? image_url : socialMediaDetails.image_url,
          link: payload.link,
        },
      });

      return successResponse(
        'Social Media is updated successfully!',
        updateSocialMedia,
      );
    } catch (error) {
      processException(error);
    }
  }

  async deleteSocialMedia(id: number) {
    try {
      const details = await this.prisma.socialMedia.findFirst({
        where: {
          id: id,
        },
      });
      if (!details) {
        return errorResponse('Invalid request!');
      }

      await this.prisma.socialMedia.delete({
        where: {
          id: details.id,
        },
      });

      return successResponse('Social media is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }

  async getActiveReviewList() {
    try {
      const reviewList = await this.prisma.review.findMany({
        where: {
          status: coreConstant.ACTIVE,
        },
      });

      reviewList.map(function (query) {
        return (query.user_image_url = addPhotoPrefix(query.user_image_url));
      });

      return successResponse('Active review list', reviewList);
    } catch (error) {
      processException(error);
    }
  }

  async getAllActiveSocialMedia() {
    try {
      const socialMediaList = await this.prisma.socialMedia.findMany({
        where: {
          status: coreConstant.ACTIVE,
        },
      });
      socialMediaList.map(function (query) {
        return (query.image_url = addPhotoPrefix(query.image_url));
      });
      return successResponse('Active Social media list', socialMediaList);
    } catch (error) {
      processException(error);
    }
  }
}
