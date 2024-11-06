import { Injectable } from '@nestjs/common';
import {
  addPhotoPrefix,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { CreateNewReviewDto } from './dto/create-new-review.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  DefaultPaginationMetaData,
  coreConstant,
} from 'src/shared/helpers/coreConstant';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewReview(payload: CreateNewReviewDto) {
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
      const newReview = await this.prisma.review.create({
        data: {
          user_name: payload.user_name,
          designation: payload.designation,
          user_image_url: image_url,
          comment: payload.comment,
          rating: payload.rating,
          status: payload.status,
        },
      });
      return successResponse('New review is addedd successfully!', newReview);
    } catch (error) {
      processException(error);
    }
  }

  async getReviewListForAdmin(payload: any) {
    try {
      const data = {};
      const whereClause = payload.search
        ? {
            OR: [
              {
                user_name: {
                  contains: payload.search,
                },
              },
              {
                designation: {
                  contains: payload.search,
                },
              },
            ],
          }
        : {};
      if (payload.limit || payload.offset) {
        const paginate = await paginatioOptions(payload);

        const reviewList = await this.prisma.review.findMany({
          where: whereClause,
          ...paginate,
        });

        const paginationMeta =
          reviewList.length > 0
            ? await paginationMetaData('review', payload, whereClause)
            : DefaultPaginationMetaData;

        data['list'] = reviewList;
        data['meta'] = paginationMeta;
      } else {
        const reviewList = await this.prisma.review.findMany({
          where: whereClause,
        });

        data['list'] = reviewList;
      }
      data['list'].map(function (query) {
        return (query.user_image_url = addPhotoPrefix(query.user_image_url));
      });
      return successResponse('Review List data', data);
    } catch (error) {
      processException(error);
    }
  }

  async getReviewDetails(id: number) {
    try {
      const reviewDetails = await this.prisma.review.findFirst({
        where: {
          id: id,
        },
      });

      reviewDetails.user_image_url = addPhotoPrefix(
        reviewDetails.user_image_url,
      );
      if (!reviewDetails) {
        return errorResponse('Invalid request');
      }
      return successResponse('Review details', reviewDetails);
    } catch (error) {
      processException(error);
    }
  }

  async updateReview(payload: UpdateReviewDto) {
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

      const reviewDetails = await this.prisma.review.findFirst({
        where: {
          id: payload.id,
        },
      });

      if (!reviewDetails) {
        return errorResponse('Invalid request!');
      }

      const updateReview = await this.prisma.review.update({
        where: {
          id: reviewDetails.id,
        },
        data: {
          user_name: payload.user_name,
          designation: payload.designation,
          user_image_url: image_url ? image_url : reviewDetails.user_image_url,
          comment: payload.comment,
          rating: payload.rating,
          status: payload.status,
        },
      });

      return successResponse('Review is updated successfully!', updateReview);
    } catch (error) {
      processException(error);
    }
  }

  async deleteReview(id: number) {
    try {
      const details = await this.prisma.review.findFirst({
        where: {
          id: id,
        },
      });
      if (!details) {
        return errorResponse('Invalid request!');
      }

      await this.prisma.review.delete({
        where: {
          id: details.id,
        },
      });

      return successResponse('Review is deleted successfully!');
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
}
