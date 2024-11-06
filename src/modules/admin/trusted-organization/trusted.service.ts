import { Injectable } from '@nestjs/common';
import { AddNewTrustedOrganizationDto } from './dto/add-new-trusted-organization.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  addPhotoPrefix,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import {
  DefaultPaginationMetaData,
  coreConstant,
} from 'src/shared/helpers/coreConstant';
import { UpdateTrustedOrganizationDto } from './dto/update-trusted-organization.dto';

@Injectable()
export class TrustedOrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async addNewTrustedOrganization(payload: AddNewTrustedOrganizationDto) {
    try {
      let image_url = '';
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
      const newTrustedOrganization =
        await this.prisma.trustedOrganization.create({
          data: {
            title: payload.title,
            image_url: image_url,
            status: payload.status,
          },
        });

      return successResponse(
        'Trusted organization is added successfully!',
        newTrustedOrganization,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getListOfTrustedOrganization(payload: any) {
    try {
      const paginate = await paginatioOptions(payload);
      const whereClause = {
        OR: [
          {
            title: {
              contains: payload.search ?? '',
            },
          },
        ],
      };
      const listOfTrustedOrganization =
        await this.prisma.trustedOrganization.findMany({
          where: whereClause,
          ...paginate,
        });

      listOfTrustedOrganization.map(function (query) {
        return (query.image_url = addPhotoPrefix(query.image_url));
      });

      const paginationMeta =
        listOfTrustedOrganization.length > 0
          ? await paginationMetaData(
              'trustedOrganization',
              payload,
              whereClause,
            )
          : DefaultPaginationMetaData;

      const data = {
        list: listOfTrustedOrganization,
        meta: paginationMeta,
      };

      return successResponse('List of trusted organization!', data);
    } catch (error) {
      processException(error);
    }
  }

  async getTrustedOrganizationDetails(id: number) {
    try {
      const details = await this.prisma.trustedOrganization.findFirst({
        where: {
          id: Number(id),
        },
      });

      if (!details) {
        return errorResponse('Invalid request!');
      }

      details.image_url = addPhotoPrefix(details.image_url);

      return successResponse('Trusted organization detaills', details);
    } catch (error) {
      processException(error);
    }
  }

  async updateTrustedOrganization(payload: UpdateTrustedOrganizationDto) {
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

        image_url = addPhotoPrefix(fileDetails.file_path);
      }

      const trustedOrganizationDetails =
        await this.prisma.trustedOrganization.findFirst({
          where: {
            id: payload.id,
          },
        });

      if (!trustedOrganizationDetails) {
        return errorResponse('Invalid request!');
      }

      const updateTrustedOrganization =
        await this.prisma.trustedOrganization.update({
          where: {
            id: trustedOrganizationDetails.id,
          },
          data: {
            title: payload.title,
            image_url: image_url
              ? image_url
              : trustedOrganizationDetails.image_url,
            status: payload.status,
          },
        });

      return successResponse(
        'Trusted organization is updated successfully!',
        updateTrustedOrganization,
      );
    } catch (error) {
      processException(error);
    }
  }

  async deleteTrustedOrganization(id: number) {
    try {
      const details = await this.prisma.trustedOrganization.findFirst({
        where: {
          id: id,
        },
      });
      if (!details) {
        return errorResponse('Invalid request!');
      }

      await this.prisma.trustedOrganization.delete({
        where: {
          id: details.id,
        },
      });

      return successResponse('Trusted organization is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }

  async getAllTrustedOrganization() {
    try {
      const list = await this.prisma.trustedOrganization.findMany({
        where: {
          status: coreConstant.ACTIVE,
        },
      });
      return successResponse('Get all trusted organizations', list);
    } catch (error) {
      processException(error);
    }
  }
}
