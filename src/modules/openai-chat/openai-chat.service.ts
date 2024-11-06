import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpenAiChatCategoryDto } from './dto/create-openai-chat-category.dto';
import {
  addPhotoPrefix,
  createNewUsesHistory,
  createSlug,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  successResponse,
  wordCountMultilingual,
} from 'src/shared/helpers/functions';
import {
  DefaultPaginationMetaData,
  RoleTypeForOpenAiChat,
  coreConstant,
} from 'src/shared/helpers/coreConstant';
import { UpdateOpenAiChatCategoryDto } from './dto/update-openai-chat-category.dto';
import { User } from '@prisma/client';
import { StartNewChat } from './dto/start-new-chat.dto';
import { SendOpenAiChatMessageDto } from './dto/send-openai-chat-message.dto';
import { PaymentsService } from '../payments/payments.service';
import { OpenAi } from '../openai/openai.service';
import { async } from 'rxjs';
import { UpdateOpenAiChatDto } from './dto/update-openai-chat.dto';
import { title } from 'process';

@Injectable()
export class OpenAiChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentsService,
  ) {}
  openaiService = new OpenAi();
  async createChatCategory(payload: CreateOpenAiChatCategoryDto) {
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

      const slug: string = await createSlug(payload.name);

      const openAiChatCategory = await this.prisma.openAiChatCategory.create({
        data: {
          name: payload.name,
          slug: slug,
          description: payload.description,
          role: payload.role,
          human_name: payload.human_name,
          color: payload.color,
          prompt_prefix: 'As a ' + payload.role,
          status: payload.status,
          image_url: image_url,
          help_with: payload.help_with,
        },
      });

      return successResponse(
        'Chat Category is created successfully!',
        openAiChatCategory,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getOpenAiChatCategoryListForAdmin(payload: any) {
    try {
      const paginate = await paginatioOptions(payload);
      const whereCondition = payload.search
        ? {
            name: {
              contains: payload.search,
            },
          }
        : {};
      const list = await this.prisma.openAiChatCategory.findMany({
        where: whereCondition,
        ...paginate,
      });

      list.map(function (query) {
        return (query.image_url = addPhotoPrefix(query.image_url));
      });

      const paginationMeta =
        list.length > 0
          ? await paginationMetaData(
              'openAiChatCategory',
              payload,
              whereCondition,
            )
          : DefaultPaginationMetaData;

      const data = {
        list: list,
        meta: paginationMeta,
      };

      return successResponse('Open Ai Chat Category list with paginate', data);
    } catch (error) {
      processException(error);
    }
  }

  async getOpenAiActiveChatCategoryList(user: User, payload: any) {
    try {
      const paginate = await paginatioOptions(payload);
      const whereCondition = payload.search
        ? {
            status: coreConstant.ACTIVE,
            name: {
              contains: payload.search,
            },
          }
        : { status: coreConstant.ACTIVE };
      const list = await this.prisma.openAiChatCategory.findMany({
        where: whereCondition,
        ...paginate,
      });

      list.map(function (query) {
        return (query.image_url = addPhotoPrefix(query.image_url));
      });

      const paginationMeta =
        list.length > 0
          ? await paginationMetaData(
              'openAiChatCategory',
              payload,
              whereCondition,
            )
          : DefaultPaginationMetaData;

      const data = {
        list: list,
        meta: paginationMeta,
      };

      return successResponse(
        'Open Ai active Chat Category list with paginate',
        data,
      );
    } catch (error) {
      processException(error);
    }
  }

  async getOpenAiChatCategoryDetails(id: number) {
    try {
      const openAiChatCategoryDetails =
        await this.prisma.openAiChatCategory.findFirst({
          where: {
            id: id,
          },
        });

      openAiChatCategoryDetails.image_url = addPhotoPrefix(
        openAiChatCategoryDetails.image_url,
      );

      if (openAiChatCategoryDetails) {
        return successResponse(
          'OpenAi Chat category details',
          openAiChatCategoryDetails,
        );
      } else {
        return errorResponse('Invalid Request!');
      }
    } catch (error) {
      processException(error);
    }
  }

  async updateChatCategory(payload: UpdateOpenAiChatCategoryDto) {
    try {
      const checkCategory = await this.prisma.openAiChatCategory.findFirst({
        where: {
          id: payload.id,
        },
      });
      if (!checkCategory) {
        return errorResponse('Invalid Request!');
      }

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

      const slug: string = await createSlug(payload.name);

      const updateChatCategory = await this.prisma.openAiChatCategory.update({
        where: {
          id: checkCategory.id,
        },
        data: {
          name: payload.name,
          slug: slug,
          description: payload.description,
          role: payload.role,
          human_name: payload.human_name,
          color: payload.color,
          prompt_prefix: 'As a ' + payload.role,
          status: payload.status,
          image_url: image_url ? image_url : checkCategory.image_url,
          help_with: payload.help_with,
        },
      });

      return successResponse(
        'Chat Category is created successfully!',
        updateChatCategory,
      );
    } catch (error) {
      processException(error);
    }
  }

  async deleteOpenAiChatCategory(id: number) {
    try {
      const checkCategory = await this.prisma.openAiChatCategory.findFirst({
        where: {
          id: id,
        },
      });
      if (!checkCategory) {
        return errorResponse('Invalid Request!');
      }

      await this.prisma.openAiChatCategory.delete({
        where: {
          id: id,
        },
      });

      return successResponse('OpenAi Chat category is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }

  async startNewChat(user: User, payload: StartNewChat) {
    try {
      const checkUserPackageResponse: any =
        await this.paymentService.checkSubscriptionStatus(user);

      if (checkUserPackageResponse.success === false) {
        return checkUserPackageResponse;
      }
      const userPackageData: any = checkUserPackageResponse.data;

      if (userPackageData.word_limit_exceed) {
        return errorResponse(
          'Your word limit exceed, please, purchase an addiotional package!',
        );
      }

      const checkCategory = await this.prisma.openAiChatCategory.findFirst({
        where: {
          id: payload.chat_category_id,
        },
      });

      if (!checkCategory) {
        return errorResponse('Invalid Request!');
      }

      const userOpenAiChat = await this.prisma.userOpenAiChat.create({
        data: {
          title: checkCategory.name + ' Chat',
          userId: user.id,
          openAiChatCategoryId: checkCategory.id,
        },
      });

      const prompt =
        'You will now play a character and respond as that character (You will never break character). Your name is ' +
        checkCategory.human_name +
        'I want you to act as a ' +
        checkCategory.role +
        checkCategory.prompt_prefix +
        ', ' +
        checkCategory.help_with;

      await this.prisma.userOpenAiChatMessages.create({
        data: {
          role: RoleTypeForOpenAiChat.System,
          content: prompt,
          userId: user.id,
          userOpenAiChatId: userOpenAiChat.id,
        },
      });

      let message: any = [];
      let temp = {};
      temp['role'] = RoleTypeForOpenAiChat.System;
      temp['content'] = prompt;
      message.push(temp);

      await this.openaiService.init();
      const responseOpenAi = await this.openaiService.chatCompletions(
        message,
        1,
        userPackageData.model,
      );

      const resultOfPrompt = responseOpenAi.choices[0].message.content;
      const wordCount = wordCountMultilingual(resultOfPrompt);

      const openAiChat = await this.prisma.userOpenAiChatMessages.create({
        data: {
          role: RoleTypeForOpenAiChat.Assistant,
          content: resultOfPrompt,
          userId: user.id,
          userOpenAiChatId: userOpenAiChat.id,
          total_words: wordCount,
        },
        include: {
          UserOpenAiChat: {
            include: {
              OpenAiChatCategory: {
                select: {
                  image_url: true,
                },
              },
            },
          },
        },
      });

      openAiChat.UserOpenAiChat.OpenAiChatCategory.image_url = openAiChat
        .UserOpenAiChat?.OpenAiChatCategory?.image_url
        ? addPhotoPrefix(openAiChat.UserOpenAiChat.OpenAiChatCategory.image_url)
        : openAiChat.UserOpenAiChat.OpenAiChatCategory.image_url;

      await this.paymentService.updateUserUsedWords(
        userPackageData.id,
        wordCount,
      );

      await createNewUsesHistory(
        user.id,
        coreConstant.AVAILABLE_FEATURES.CODE,
        userOpenAiChat.title,
        wordCount,
        0,
      );

      return successResponse('New chat is created successfully!', openAiChat);
    } catch (error) {
      processException(error);
    }
  }

  async getOpenAiChatCategoryList(user: User, id: number, payload: any) {
    try {
      const list = await this.prisma.userOpenAiChat.findMany({
        where: {
          openAiChatCategoryId: id,
          userId: user.id,
          OR: {
            title: {
              contains: payload.search ? payload.search : '',
            },
          },
        },
        include: {
          OpenAiChatCategory: {
            select: {
              image_url: true,
            },
          },
        },
      });

      list.map((item) => {
        return (item.OpenAiChatCategory.image_url = item.OpenAiChatCategory
          ?.image_url
          ? addPhotoPrefix(item.OpenAiChatCategory.image_url)
          : item.OpenAiChatCategory?.image_url);
      });

      return successResponse('Category wise chat list', list);
    } catch (error) {
      processException(error);
    }
  }

  async getOpenAiChatDetails(user: User, id: number, payload: any) {
    try {
      const checkChat = await this.prisma.userOpenAiChat.findFirst({
        where: {
          id: id,
        },
      });
      if (!checkChat) {
        return errorResponse('Invalid Request!');
      }
      const chatDetails = await this.prisma.userOpenAiChatMessages.findMany({
        where: {
          userOpenAiChatId: checkChat.id,
          userId: user.id,
        },
      });

      return successResponse('Chat details', chatDetails);
    } catch (error) {
      processException(error);
    }
  }

  async sendOpenAiChatMessage(user: User, payload: SendOpenAiChatMessageDto) {
    try {
      const checkOpenAiChat = await this.prisma.userOpenAiChat.findFirst({
        where: {
          id: payload.openai_chat_id,
          userId: user.id,
        },
      });

      if (!checkOpenAiChat) {
        return errorResponse('Invalid Request!');
      }

      const checkUserPackageResponse: any =
        await this.paymentService.checkSubscriptionStatus(user);

      if (checkUserPackageResponse.success === false) {
        return checkUserPackageResponse;
      }
      const userPackageData: any = checkUserPackageResponse.data;

      if (userPackageData.word_limit_exceed) {
        return errorResponse(
          'Your word limit exceed, please, purchase an addiotional package!',
        );
      }

      const chatMessage = await this.prisma.userOpenAiChatMessages.create({
        data: {
          role: RoleTypeForOpenAiChat.User,
          content: payload.message,
          userId: user.id,
          userOpenAiChatId: checkOpenAiChat.id,
        },
      });

      const chatList = await this.prisma.userOpenAiChatMessages.findMany({
        where: {
          userId: user.id,
          userOpenAiChatId: checkOpenAiChat.id,
        },
      });

      let message: any = [];
      chatList.forEach(async (element) => {
        const temp = {}; // Create a new object for each message
        temp['role'] = element.role;
        temp['content'] = element.content;
        message.push(temp);
      });

      await this.openaiService.init();
      const responseOpenAi = await this.openaiService.chatCompletions(
        message,
        1,
        userPackageData.model,
      );
      const resultOfPrompt = responseOpenAi.choices[0].message.content;
      const wordCount = wordCountMultilingual(resultOfPrompt);

      await this.prisma.userOpenAiChatMessages.create({
        data: {
          role: RoleTypeForOpenAiChat.Assistant,
          content: resultOfPrompt,
          userId: user.id,
          userOpenAiChatId: checkOpenAiChat.id,
          total_words: wordCount,
        },
      });

      await this.paymentService.updateUserUsedWords(
        userPackageData.id,
        wordCount,
      );

      const latestChatList = await this.prisma.userOpenAiChatMessages.findMany({
        where: {
          userId: user.id,
          userOpenAiChatId: checkOpenAiChat.id,
        },
      });

      await createNewUsesHistory(
        user.id,
        coreConstant.AVAILABLE_FEATURES.CODE,
        checkOpenAiChat.title,
        wordCount,
        0,
      );

      return successResponse('Message Send successfully!', latestChatList);
    } catch (error) {
      processException(error);
    }
  }

  async updateChatTitle(user: User, payload: UpdateOpenAiChatDto) {
    try {
      const checkChat = await this.prisma.userOpenAiChat.findFirst({
        where: {
          id: payload.chat_id,
          userId: user.id,
        },
      });

      if (!checkChat) {
        return errorResponse('Invalid Request!');
      }

      const updateChat = await this.prisma.userOpenAiChat.update({
        where: {
          id: checkChat.id,
        },
        data: {
          title: payload.title,
        },
      });

      return successResponse(
        'Your Chat details is updated successfully!',
        updateChat,
      );
    } catch (error) {
      processException(error);
    }
  }

  async deleteOpenAiChatDetails(user: User, id: number) {
    try {
      const checkChat = await this.prisma.userOpenAiChat.findFirst({
        where: {
          id: id,
          userId: user.id,
        },
      });

      if (!checkChat) {
        return errorResponse('Invalid Request!');
      }

      await this.prisma.userOpenAiChatMessages.deleteMany({
        where: {
          userOpenAiChatId: checkChat.id,
          userId: user.id,
        },
      });

      await this.prisma.userOpenAiChat.delete({
        where: {
          id: checkChat.id,
        },
      });

      return successResponse('Your chat is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }
}
