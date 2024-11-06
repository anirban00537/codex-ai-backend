import { Injectable } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import {
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  successResponse,
} from 'src/shared/helpers/functions';
import { PrismaService } from '../prisma/prisma.service';
import { paginateInterface } from 'src/shared/constants/types';
import { GetFaqListByTypePaginate } from './dto/get-list-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async createFaq(payload: CreateFaqDto) {
    try {
      const faqDetails = await this.prisma.faq.create({
        data: {
          ...payload,
        },
      });

      return successResponse('Faq is created successfully!', faqDetails);
    } catch (error) {
      processException(error);
    }
  }

  async getListFaq(payload: GetFaqListByTypePaginate) {
    try {
      const data = {};
      const paginate = await paginatioOptions(payload);
      const whereCondition = {
        type: payload.type !== undefined ? Number(payload.type) : undefined,
      };

      const faqList = await this.prisma.faq.findMany({
        where: whereCondition,
        ...paginate,
      });
      const paginationMeta = await paginationMetaData(
        'faq',
        payload,
        whereCondition,
      );

      data['list'] = faqList;
      data['meta'] = paginationMeta;
      return successResponse('Faq list with paginate', data);
    } catch (error) {
      processException(error);
    }
  }

  async updateFaq(payload: UpdateFaqDto) {
    try {
      const faqDetails = await this.prisma.faq.findFirst({
        where: {
          id: payload.id,
        },
      });
      if (!faqDetails) {
        return errorResponse('Invalid request!');
      }
      const { type, question, answer, status } = payload;
      const updateFaqDetails = await this.prisma.faq.update({
        where: {
          id: faqDetails.id,
        },
        data: {
          type,
          question,
          answer,
          status,
        },
      });
      return successResponse('Faq is updated successfully!', updateFaqDetails);
    } catch (error) {
      processException(error);
    }
  }

  async getFaqDetails(id: number) {
    try {
      const faqDetails = await this.prisma.faq.findFirst({
        where: {
          id: id,
        },
      });

      if (!faqDetails) {
        return errorResponse('Faq details is not found!');
      }

      return successResponse('Faq details!', faqDetails);
    } catch (error) {
      processException(error);
    }
  }

  async deleteFaq(id: number) {
    try {
      const faqDetails = await this.prisma.faq.findFirst({
        where: {
          id: id,
        },
      });

      if (!faqDetails) {
        return errorResponse('Faq details is not found!');
      }

      await this.prisma.faq.delete({
        where: {
          id: faqDetails.id,
        },
      });

      return successResponse('Faq is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }
}
