import { Injectable } from '@nestjs/common';
import {
  addPhotoPrefix,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { CreateNewFeatureAiDto } from './dto/create-new-feature.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  DefaultPaginationMetaData,
  coreConstant,
} from 'src/shared/helpers/coreConstant';
import { UpdateFeatureAiDto } from './dto/update-feature.dto';

@Injectable()
export class FeatureAiService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewFeatureOfAi(payload: CreateNewFeatureAiDto) {
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
      const newFeature = await this.prisma.featureOfAI.create({
        data: {
          category_name: payload.category_name,
          title: payload.title,
          description: payload.description,
          file_url: image_url,
          status: payload.status,
        },
      });
      return successResponse(
        'New feature of ai is addedd successfully!',
        newFeature,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getFeatureAiListForAdmin(payload: any) {
    try {
      const data = {};
      const whereClause = payload.search
        ? {
            OR: [
              {
                category_name: {
                  contains: payload.search,
                },
              },
              {
                title: {
                  contains: payload.search,
                },
              },
            ],
          }
        : {};
      if (payload.limit || payload.offset) {
        const paginate = await paginatioOptions(payload);

        const featureOfAIList = await this.prisma.featureOfAI.findMany({
          where: whereClause,
          ...paginate,
        });

        const paginationMeta =
          featureOfAIList.length > 0
            ? await paginationMetaData('featureOfAI', payload, whereClause)
            : DefaultPaginationMetaData;

        data['list'] = featureOfAIList;
        data['meta'] = paginationMeta;
      } else {
        const featureOfAIList = await this.prisma.featureOfAI.findMany({
          where: whereClause,
        });

        data['list'] = featureOfAIList;
      }

      return successResponse('Feature Ai List data', data);
    } catch (error) {
      processException(error);
    }
  }

  async getFeatureOfAiDetails(id: number) {
    try {
      const featureDetails = await this.prisma.featureOfAI.findFirst({
        where: {
          id: id,
        },
      });
      if (!featureDetails) {
        return errorResponse('Invalid request');
      }
      featureDetails.file_url = addPhotoPrefix(featureDetails.file_url);
      return successResponse('Feature of AI details', featureDetails);
    } catch (error) {
      processException(error);
    }
  }

  async updateFeatureOfAi(payload: UpdateFeatureAiDto) {
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

      const featureDetails = await this.prisma.featureOfAI.findFirst({
        where: {
          id: payload.id,
        },
      });

      if (!featureDetails) {
        return errorResponse('Invalid request!');
      }
      const updateFeatureOfAi = await this.prisma.featureOfAI.update({
        where: {
          id: featureDetails.id,
        },
        data: {
          category_name: payload.category_name,
          title: payload.title,
          description: payload.description,
          file_url: image_url ? image_url : featureDetails.file_url,
          status: payload.status,
        },
      });

      return successResponse(
        'Feature of AI is updated successfully!',
        updateFeatureOfAi,
      );
    } catch (error) {
      processException(error);
    }
  }

  async deleteFeatureOfAi(id: number) {
    try {
      const details = await this.prisma.featureOfAI.findFirst({
        where: {
          id: id,
        },
      });
      if (!details) {
        return errorResponse('Invalid request!');
      }

      await this.prisma.featureOfAI.delete({
        where: {
          id: details.id,
        },
      });

      return successResponse('Feature of AI is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }

  async getActiveFeatureOfAiList() {
    try {
      const featureOfAIList = await this.prisma.featureOfAI.findMany({
        where: {
          status: coreConstant.ACTIVE,
        },
      });
      let prepareData = [];
      featureOfAIList.map((item) => {
        item.file_url = addPhotoPrefix(item.file_url);
        prepareData.push(item);
      });

      return successResponse('Active feature of ai list', prepareData);
    } catch (error) {
      processException(error);
    }
  }
}
