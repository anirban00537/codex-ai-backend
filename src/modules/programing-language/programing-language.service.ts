import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { AddNewProgramingLanguageDto } from './dto/add-programing-language.dto';
import {
  DefaultPaginationMetaData,
  coreConstant,
} from 'src/shared/helpers/coreConstant';
import { UpdateProgramingLanguageDto } from './dto/update-programing-language.dto';

@Injectable()
export class ProgramingLanguageService {
  constructor(private readonly prisma: PrismaService) {}

  async addNewProgramingLanguage(payload: AddNewProgramingLanguageDto) {
    try {
      const newLanguage = await this.prisma.programingLanguage.create({
        data: {
          name: payload.name,
          status: payload.status,
        },
      });

      return successResponse(
        'New Programing language is added successfully!',
        newLanguage,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getProgramingLanguageListForAdmin(payload) {
    try {
      const data = {};
      const whereClause = payload.search
        ? {
            OR: [
              {
                name: {
                  contains: payload.search,
                },
              },
            ],
          }
        : {};
      if (payload.limit || payload.offset) {
        const paginate = await paginatioOptions(payload);

        const languageList = await this.prisma.programingLanguage.findMany({
          where: whereClause,
          ...paginate,
        });

        const paginationMeta =
          languageList.length > 0
            ? await paginationMetaData(
                'programingLanguage',
                payload,
                whereClause,
              )
            : DefaultPaginationMetaData;

        data['list'] = languageList;
        data['meta'] = paginationMeta;
      } else {
        const languageList = await this.prisma.programingLanguage.findMany({
          where: whereClause,
        });

        data['list'] = languageList;
      }

      return successResponse('Programing Language List data', data);
    } catch (error) {
      processException(error);
    }
  }

  async getProgramingLanguageDetails(id: number) {
    try {
      const languageDetails = await this.prisma.programingLanguage.findFirst({
        where: {
          id: id,
        },
      });

      if (!languageDetails) {
        return errorResponse('Invalid Request!');
      }

      return successResponse('Programing language details', languageDetails);
    } catch (error) {
      processException(error);
    }
  }

  async updateProgramingLanguage(payload: UpdateProgramingLanguageDto) {
    try {
      const languageDetails = await this.prisma.programingLanguage.findFirst({
        where: {
          id: payload.id,
        },
      });

      if (!languageDetails) {
        return errorResponse('Invalid Request!');
      }

      const updateLanguage = await this.prisma.programingLanguage.update({
        where: {
          id: languageDetails.id,
        },
        data: {
          name: payload.name,
          status: payload.status,
        },
      });

      return successResponse(
        'Programing language is updated successfully!',
        updateLanguage,
      );
    } catch (error) {
      processException(error);
    }
  }

  async deleteProgramingLanguage(id: number) {
    try {
      const languageDetails = await this.prisma.programingLanguage.findFirst({
        where: {
          id: id,
        },
      });

      if (!languageDetails) {
        return errorResponse('Invalid Request!');
      }
      await this.prisma.programingLanguage.delete({
        where: {
          id: languageDetails.id,
        },
      });

      return successResponse('Programing language is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }

  async getAllActiveProgramingLanguageList() {
    try {
      const languageList = await this.prisma.programingLanguage.findMany({
        where: {
          status: coreConstant.ACTIVE,
        },
      });

      return successResponse('Programing language active list', languageList);
    } catch (error) {
      processException(error);
    }
  }
}
