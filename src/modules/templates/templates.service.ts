import { Injectable } from '@nestjs/common';
const fs = require('fs');
const path = require('path');
import {
  checkValidationForContentGenerateUseTemplate,
  saveBase64ImageAsJpg,
  errorResponse,
  paginatioOptions,
  paginationMetaData,
  processException,
  setDynamicValueInPrompt,
  successResponse,
  wordCountMultilingual,
  addPhotoPrefix,
  generatePromptForCode,
  generatePromptForTranslate,
  createNewUsesHistory,
  saveAudioLocally,
  generatePromptForJson,
  isValidArrayOfObjectsStringChecker,
} from 'src/shared/helpers/functions';
import { AddNewCategoryDto } from './dto/add-new-category.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AddNewTemplateDto } from './dto/add-new-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { GenerateImageDto } from './dto/generate-image.dto';
import { ResponseModel } from 'src/shared/models/response.model';
import { MyImages, Template, User } from '@prisma/client';
import { OpenAi } from '../openai/openai.service';
import { PaymentsService } from '../payments/payments.service';
import {
  DefaultPaginationMetaData,
  coreConstant,
} from 'src/shared/helpers/coreConstant';
import { MakeTemplateFavourite } from './dto/make-template-favourite.dto';
import { GenerateOpenAiCodeDto } from './dto/generate-code.dto';
import { paginateInterface } from 'src/shared/constants/types';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { LanguageListJsonArray } from 'src/shared/constants/array.constants';
import { title } from 'process';
import { TextTranslateDto } from './dto/text-translate.dto';
import { JsonGenerate } from './dto/json-generate.dto';

@Injectable()
export class TemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentsService,
  ) {}
  openaiService = new OpenAi();

  async addNewCategory(payload: AddNewCategoryDto) {
    try {
      const checkNameUnique = await this.prisma.templateCategory.findFirst({
        where: {
          name: {
            contains: payload.name,
          },
        },
      });
      if (checkNameUnique) {
        return errorResponse('This category is already has!');
      }
      const data = await this.prisma.templateCategory.create({
        data: {
          ...payload,
        },
      });

      return successResponse('Category is added successfully!', data);
    } catch (error) {
      processException(error);
    }
  }

  async updateCategory(payload: UpdateCategoryDto) {
    try {
      const checkNameUnique = await this.prisma.templateCategory.findFirst({
        where: {
          id: {
            not: payload.id,
          },
          name: {
            contains: payload.name,
          },
        },
      });

      if (checkNameUnique) {
        return errorResponse('This category is already has!');
      }
      const { name, description, status } = payload;
      const data = await this.prisma.templateCategory.update({
        where: {
          id: payload.id,
        },
        data: {
          name,
          description,
          status,
        },
      });

      return successResponse('Category is update successfully!', data);
    } catch (error) {
      processException(error);
    }
  }

  async getListCategory(payload: any) {
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

        const categoryList = await this.prisma.templateCategory.findMany({
          where: whereClause,
          ...paginate,
        });

        const paginationMeta =
          categoryList.length > 0
            ? await paginationMetaData('templateCategory', payload)
            : DefaultPaginationMetaData;

        data['list'] = categoryList;
        data['meta'] = paginationMeta;
      } else {
        const categoryList = await this.prisma.templateCategory.findMany({
          where: whereClause,
        });

        data['list'] = categoryList;
      }

      return successResponse('Category List data', data);
    } catch (error) {
      processException(error);
    }
  }

  async getListCategoryForUser(payload: any) {
    try {
      const data = {};
      if (payload.limit || payload.offset) {
        const paginate = await paginatioOptions(payload);

        const categoryList = await this.prisma.templateCategory.findMany({
          where: {
            status: coreConstant.ACTIVE,
          },
          ...paginate,
        });

        const paginationMeta = await paginationMetaData(
          'templateCategory',
          payload,
        );

        data['list'] = categoryList;
        data['meta'] = paginationMeta;
      } else {
        const categoryList = await this.prisma.templateCategory.findMany({
          where: {
            status: coreConstant.ACTIVE,
          },
        });

        data['list'] = categoryList;
      }

      return successResponse('Category List data', data);
    } catch (error) {
      processException(error);
    }
  }

  async deleteCategory(id: number) {
    try {
      const checkCategory = await this.prisma.templateCategory.findFirst({
        where: {
          id: id,
        },
      });

      if (!checkCategory) {
        return errorResponse('Category is not found!');
      }

      const checkTemplateList = await this.prisma.template.findMany({
        where: {
          category_id: checkCategory.id,
        },
      });

      if (checkTemplateList.length > 0) {
        return errorResponse(
          'Remove this category from template, then try to delete!',
        );
      }

      await this.prisma.templateCategory.delete({
        where: {
          id: checkCategory.id,
        },
      });

      return successResponse('Category is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }

  async getCategoryDetails(id: number) {
    try {
      const categoryDetails = await this.prisma.templateCategory.findFirst({
        where: {
          id,
        },
      });
      if (categoryDetails) {
        return successResponse('Category details', categoryDetails);
      } else {
        return errorResponse('Category is not found!');
      }
    } catch (error) {
      processException(error);
    }
  }

  async addNewCustomTemplate(payload: AddNewTemplateDto) {
    try {
      const {
        title,
        description,
        color,
        category_id,
        package_type,
        prompt_input,
        prompt,
        status,
        icon_tag,
        input_groups,
      } = payload;
      const checkCategoryId = await this.prisma.templateCategory.findFirst({
        where: {
          id: category_id,
        },
      });

      if (!checkCategoryId) {
        return errorResponse('Invalid Category Id!');
      }

      const newTemplateData = await this.prisma.template.create({
        data: {
          title,
          description,
          color,
          category_id,
          package_type,
          prompt_input,
          prompt,
          status,
          icon_tag,
        },
      });

      const inputGroupPromises = input_groups.map((inputGroup, key) => {
        return this.prisma.templateField.create({
          data: {
            field_name: inputGroup.name,
            input_field_name: inputGroup.input_field_name,
            type: inputGroup.type,
            template_id: newTemplateData.id,
            description: inputGroup.description,
          },
        });
      });

      await Promise.all(inputGroupPromises);

      const templateData = await this.prisma.template.findFirst({
        where: {
          id: newTemplateData.id,
        },
        include: {
          TemplateField: true,
        },
      });
      return successResponse('A new template is created!', templateData);
    } catch (error) {
      processException(error);
    }
  }

  async getTemplateList(payload: any) {
    try {
      const paginate = await paginatioOptions(payload);
      const whereCondition = payload.search
        ? {
            OR: [
              {
                title: {
                  contains: payload.search,
                },
              },
              {
                templateCategory: {
                  name: {
                    contains: payload.search,
                  },
                },
              },
            ],
          }
        : {};

      const templateList = await this.prisma.template.findMany({
        where: whereCondition,
        include: {
          templateCategory: true,
          TemplateField: true,
        },
        ...paginate,
      });

      const paginationMeta =
        templateList.length > 0
          ? await paginationMetaData('template', payload)
          : DefaultPaginationMetaData;

      const data = {
        list: templateList,
        meta: paginationMeta,
      };

      return successResponse('Template List with paginate', data);
    } catch (error) {
      processException(error);
    }
  }

  async getTemplateDetails(id: number) {
    try {
      const templateDetails = await this.prisma.template.findFirst({
        where: {
          id: id,
        },
        include: {
          TemplateField: true,
        },
      });

      if (templateDetails) {
        return successResponse('Template details', templateDetails);
      } else {
        return errorResponse('Invalid request!');
      }
    } catch (error) {
      processException(error);
    }
  }

  async updateTemplate(payload: UpdateTemplateDto) {
    return this.prisma.$transaction(async (prisma) => {
      try {
        const templateDetails = await prisma.template.findFirst({
          where: {
            id: payload.id,
          },
        });

        if (!templateDetails) {
          return errorResponse('Invalid request!');
        }
        const {
          id,
          title,
          description,
          color,
          category_id,
          package_type,
          prompt_input,
          prompt,
          status,
          icon_tag,
          input_groups,
        } = payload;

        const checkCategoryId = await this.prisma.templateCategory.findFirst({
          where: {
            id: category_id,
          },
        });

        if (!checkCategoryId) {
          return errorResponse('Invalid Category Id!');
        }
        const updateTemplateData = await prisma.template.update({
          where: {
            id: templateDetails.id,
          },
          data: {
            title,
            description,
            color,
            category_id,
            package_type,
            prompt_input,
            prompt,
            status,
            icon_tag,
          },
        });

        const existingFieldsMap = await prisma.templateField.findMany({
          where: {
            template_id: updateTemplateData.id,
          },
        });

        for (let i = 0; i < input_groups.length; i++) {
          const inputGroup = input_groups[i];
          const { type, name, description } = inputGroup;
          const existingTemplateFieldData = existingFieldsMap.find(
            (object) => object.field_name === name,
          );

          if (existingTemplateFieldData) {
            const existingTemplateFieldIndex = existingFieldsMap.findIndex(
              (object) => object.field_name === name,
            );
            await prisma.templateField.update({
              where: {
                id: existingTemplateFieldData.id,
              },
              data: {
                type: type,
                description: description,
              },
            });

            existingFieldsMap.splice(existingTemplateFieldIndex, 1);
          } else {
            await prisma.templateField.create({
              data: {
                field_name: inputGroup.name,
                input_field_name: inputGroup.input_field_name,
                type: inputGroup.type,
                template_id: updateTemplateData.id,
                description: inputGroup.description,
              },
            });
          }
        }

        if (existingFieldsMap.length > 0) {
          for (let i = 0; i < existingFieldsMap.length; i++) {
            const existingFieldsdataToDelete = existingFieldsMap[i];
            await prisma.templateField.delete({
              where: {
                id: existingFieldsdataToDelete.id,
              },
            });
          }
        }
        const templateData = await prisma.template.findFirst({
          where: {
            id: templateDetails.id,
          },
          include: {
            TemplateField: true,
            templateCategory: true,
          },
        });
        return successResponse(
          'template is updated successfully!',
          templateData,
        );
      } catch (error) {
        processException(error);
      }
    });
  }

  async deleteTemplate(id: number) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const templateDetails = await prisma.template.findFirst({
          where: {
            id: id,
          },
        });

        if (!templateDetails) {
          return errorResponse('Template not found!');
        }

        await prisma.templateField.deleteMany({
          where: {
            template_id: templateDetails.id,
          },
        });

        await prisma.template.delete({
          where: {
            id: templateDetails.id,
          },
        });

        return successResponse('Template has been deleted successfully');
      });
    } catch (error) {
      processException(error);
    }
  }

  async generateContent(user: User, payload: any) {
    try {
      const checkValidation: ResponseModel =
        await checkValidationForContentGenerateUseTemplate(payload);

      if (checkValidation.success === false) {
        return checkValidation;
      }

      const checkUserPackageResponse: any =
        await this.paymentService.checkSubscriptionStatus(user);

      if (checkUserPackageResponse.success === false) {
        return checkUserPackageResponse;
      }
      const userPackageData: any = checkUserPackageResponse.data;

      const remainingWords =
        userPackageData.total_words - userPackageData.used_words;
      if (
        userPackageData.word_limit_exceed ||
        payload.maximum_length > remainingWords
      ) {
        return errorResponse(
          'Your word limit exceed, please, purchase an addiotional package!',
        );
      }

      const templateDetails = await this.prisma.template.findFirst({
        where: {
          id: payload.template_id,
        },
      });

      const prompt = templateDetails.prompt;

      const finalPrompt = await setDynamicValueInPrompt(prompt, payload);
      console.log(finalPrompt, 'finalPrompt');
      await this.openaiService.init();
      const response = await this.openaiService.textCompletion(
        finalPrompt,
        payload.number_of_result,
        userPackageData.model,
      );

      if (!response) {
        return errorResponse('Something went wrong!');
      }

      const resultOfPrompt = response.choices[0].message.content;
      const wordCount = wordCountMultilingual(resultOfPrompt);

      await this.paymentService.updateUserUsedWords(
        userPackageData.id,
        wordCount,
      );
      const title: string = payload.document_title
        ? payload.document_title
        : 'Untitled Document';
      await this.saveDocument(
        title,
        finalPrompt,
        resultOfPrompt,
        templateDetails.id,
        user.id,
        wordCount,
      );

      await createNewUsesHistory(
        user.id,
        coreConstant.AVAILABLE_FEATURES.CONTENT_WRITING,
        title,
        wordCount,
        0,
      );

      return successResponse('Text is generated successfully!', response);
    } catch (error) {
      if (error.error.message) {
        return errorResponse(error.error.message);
      }
      processException(error);
    }
  }

  async saveDocument(
    title: string,
    prompt: string,
    result: string,
    template_id: number,
    user_id: number,
    total_used_words: number,
  ) {
    try {
      const saveDocument = await this.prisma.myDocuments.create({
        data: {
          title,
          prompt,
          result,
          template_id,
          user_id,
          total_used_words,
        },
      });
      return saveDocument;
    } catch (error) {
      processException(error);
    }
  }

  async generateImage(user: User, payload: GenerateImageDto) {
    try {
      const checkUserPackageResponse: any =
        await this.paymentService.checkSubscriptionStatus(user);

      if (checkUserPackageResponse.success === false) {
        return checkUserPackageResponse;
      }
      const userPackageData: any = checkUserPackageResponse.data;

      if (userPackageData.image_limit_exceed) {
        return errorResponse(
          'Your image limit exceed, please, purchase an addiotional package!',
        );
      }

      await this.openaiService.init();

      const response = await this.openaiService.imageGenerate(
        payload.prompt,
        payload.image_size,
      );
      const imageUrl: any = await saveBase64ImageAsJpg(
        response.data[0].b64_json,
      );
      await this.saveImageDocument(
        payload.prompt,
        imageUrl.imageUrl,
        imageUrl.fileName,
        user.id,
      );
      if (!response) {
        return errorResponse('Something went wrong!');
      }
      this.paymentService.updateUserUsedImages(userPackageData.id, 1);

      await createNewUsesHistory(
        user.id,
        coreConstant.AVAILABLE_FEATURES.IMAGE_GENERATION,
        payload.prompt,
        0,
        1,
      );

      return successResponse('Image is generated successfully!', response);
    } catch (error) {
      if (error.error.message) {
        return errorResponse(error.error.message);
      }
      processException(error);
    }
  }
  async saveImageDocument(
    prompt: string,
    image_url: string,
    image_name: string,
    user_id: number,
  ): Promise<MyImages> {
    try {
      const saveImage = await this.prisma.myImages.create({
        data: {
          prompt,
          image_url: image_url,
          image_name,
          user_id,
        },
      });

      return saveImage;
    } catch (error) {
      processException(error);
    }
  }
  async getAllImageDocument(
    user: User,
    paginationOptions: any,
  ): Promise<ResponseModel> {
    try {
      const paginate = await paginatioOptions(paginationOptions);
      const whereCondition = {
        user_id: user.id,
      };

      let imageDocuments = await this.prisma.myImages.findMany({
        where: whereCondition,
        orderBy: {
          created_at: 'desc',
        },
        ...paginate,
      });
      let images_with_url = [];
      imageDocuments.map((image) => {
        image.image_url = addPhotoPrefix(image.image_url);
        images_with_url.push(image);
      });
      const paginationMeta = await paginationMetaData(
        'myImages',
        paginationOptions,
        whereCondition,
      );

      const data = {
        list: images_with_url,
        meta: paginationMeta,
      };

      return successResponse('Image Documents List by user', data);
    } catch (error) {
      processException(error);
    }
  }
  async getImageDocumentDetails(
    id: number,
    user: User,
  ): Promise<ResponseModel> {
    try {
      let imageDocumentDetails = await this.prisma.myImages.findFirst({
        where: {
          id,
          user_id: user.id,
        },
      });
      imageDocumentDetails.image_url = addPhotoPrefix(
        imageDocumentDetails.image_url,
      );

      if (!imageDocumentDetails) {
        return errorResponse('Image Document not found!');
      }

      return successResponse('Image Document details', imageDocumentDetails);
    } catch (error) {
      processException(error);
    }
  }
  async getDocumentListByPaginate(payload: any, user: User) {
    try {
      const paginate = await paginatioOptions(payload);
      const whereClause = {
        user_id: user.id,
        OR: [
          {
            title: {
              contains: payload.search ? payload.search : '',
            },
          },
        ],
      };

      const documentList = await this.prisma.myDocuments.findMany({
        where: whereClause,
        include: {
          template: {
            select: {
              title: true,
              color: true,
              templateCategory: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        ...paginate,
      });
      const paginationMeta = await paginationMetaData(
        'myDocuments',
        payload,
        whereClause,
      );

      const data = {
        list: documentList,
        meta: paginationMeta,
      };
      return successResponse('Document List by paginate', data);
    } catch (error) {
      processException(error);
    }
  }
  async getTransacriptionsByPaginate(payload: any, user: User) {
    try {
      const paginate = await paginatioOptions(payload);
      const whereClause = {
        user_id: user.id,
        OR: [
          {
            result: {
              contains: payload.search ? payload.search : '',
            },
          },
        ],
      };

      const transacriptionsList =
        await this.prisma.generatedTranscription.findMany({
          where: whereClause,
          orderBy: {
            created_at: 'desc',
          },
          ...paginate,
        });
      const paginationMeta = await paginationMetaData(
        'generatedTranscription',
        payload,
        whereClause,
      );

      const data = {
        list: transacriptionsList,
        meta: paginationMeta,
      };
      return successResponse('Transacriptions List by paginate', data);
    } catch (error) {
      console.log(error, 'error');
      processException(error);
    }
  }
  async getFavouriteListByPaginate(
    payload: paginateInterface,
    user: User,
  ): Promise<ResponseModel> {
    try {
      const paginate = await paginatioOptions(payload);
      const whereCondition = {
        user_id: user.id,
        status: coreConstant.ACTIVE,
      };

      const myFavTemplate = await this.prisma.favouriteTemplate.findMany({
        where: whereCondition,
        include: {
          template: {
            include: {
              templateCategory: true,
            },
          },
        },
        ...paginate,
      });
      const paginationMeta =
        myFavTemplate.length > 0
          ? await paginationMetaData(
              'favouriteTemplate',
              payload,
              whereCondition,
            )
          : DefaultPaginationMetaData;

      const data = {
        list: myFavTemplate,
        meta: paginationMeta,
      };
      return successResponse('Favourite Template List', data);
    } catch (error) {
      processException(error);
    }
  }
  async getDocumentListByPaginateAdmin(payload: any) {
    try {
      const paginate = await paginatioOptions(payload);
      const whereClause = {
        OR: [
          {
            title: {
              contains: payload.search ? payload.search : '',
            },
          },
        ],
      };
      const documentList = await this.prisma.myDocuments.findMany({
        where: whereClause,
        ...paginate,
      });

      const paginationMeta =
        documentList.length > 0
          ? await paginationMetaData('myDocuments', payload, whereClause)
          : DefaultPaginationMetaData;

      const data = {
        list: documentList,
        meta: paginationMeta,
      };
      return successResponse('Document List by paginate', data);
    } catch (error) {
      processException(error);
    }
  }

  async getDocumentDetails(id: number) {
    try {
      const documentDetails = await this.prisma.myDocuments.findFirst({
        where: { id: id },
        include: {
          template: {
            include: {
              templateCategory: true,
            },
          },
        },
      });
      if (!documentDetails) {
        return errorResponse('Invalid request!');
      }
      return successResponse('Document details', documentDetails);
    } catch (error) {
      processException(error);
    }
  }
  async getUserTranscriptionDetails(id: number, user: User) {
    try {
      const TranscriptionDetails =
        await this.prisma.generatedTranscription.findFirst({
          where: {
            id: id,
            user_id: user.id,
          },
        });
      if (!TranscriptionDetails) {
        return errorResponse('Invalid request!');
      }
      return successResponse('Transcription details', TranscriptionDetails);
    } catch (error) {
      processException(error);
    }
  }
  async getUserDocumentDetails(id: number, user: User) {
    try {
      const documentDetails = await this.prisma.myDocuments.findFirst({
        where: {
          id: id,
          user_id: user.id,
        },
        include: {
          template: {
            include: {
              templateCategory: true,
            },
          },
        },
      });
      if (!documentDetails) {
        return errorResponse('Invalid request!');
      }
      return successResponse('Document details', documentDetails);
    } catch (error) {
      processException(error);
    }
  }

  async getTemplateListForUser(user: User, payload: any) {
    try {
      const whereCondition = {
        templateCategory: {
          status: coreConstant.ACTIVE,
        },
        ...(payload.category_id
          ? { category_id: Number(payload.category_id) }
          : {}),
        ...(payload.search
          ? {
              title: {
                contains: payload.search,
              },
            }
          : {}),
      };

      const templateList = await this.prisma.template.findMany({
        where: whereCondition,
        include: {
          templateCategory: true,
          TemplateField: true,
          FavouriteTemplate: {
            where: {
              user_id: user.id,
            },
          },
        },
        orderBy: {
          updated_at: 'desc',
        },
      });

      const data = {
        list: templateList,
      };
      return successResponse('Template list', data);
    } catch (error) {
      processException(error);
    }
  }

  async makeTemplateFavourite(user: User, payload: MakeTemplateFavourite) {
    try {
      const checkTemplate = await this.prisma.template.findFirst({
        where: {
          id: payload.template_id,
        },
      });

      if (!checkTemplate) {
        return errorResponse('Invalid Request!');
      }

      const favouriteTemplateDetails =
        await this.prisma.favouriteTemplate.findFirst({
          where: {
            user_id: user.id,
            template_id: payload.template_id,
          },
        });

      let updateFavouriteTemplate;
      if (favouriteTemplateDetails) {
        updateFavouriteTemplate = await this.prisma.favouriteTemplate.update({
          where: {
            id: favouriteTemplateDetails.id,
          },
          data: {
            status:
              favouriteTemplateDetails.status === coreConstant.ACTIVE
                ? coreConstant.INACTIVE
                : coreConstant.ACTIVE,
          },
        });
      } else {
        updateFavouriteTemplate = await this.prisma.favouriteTemplate.create({
          data: {
            user_id: user.id,
            template_id: payload.template_id,
            status: coreConstant.ACTIVE,
          },
        });
      }

      if (updateFavouriteTemplate.status === coreConstant.ACTIVE) {
        return successResponse('Template is marked as favourite!');
      } else {
        return successResponse('Template is removed from favourite!');
      }
    } catch (error) {
      processException(error);
    }
  }
  async generateOpenAiCode(user: User, payload: GenerateOpenAiCodeDto) {
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

      const prompt: string = await generatePromptForCode(
        payload.description,
        payload.coding_language,
        payload.coding_level,
      );

      await this.openaiService.init();
      const responseOpenAi = await this.openaiService.textCompletion(
        prompt,
        1,
        userPackageData.model,
      );

      if (!responseOpenAi) {
        return errorResponse('Something went wrong!');
      }

      const resultOfPrompt = responseOpenAi.choices[0].message.content;
      const wordCount = wordCountMultilingual(resultOfPrompt);

      await this.paymentService.updateUserUsedWords(
        userPackageData.id,
        wordCount,
      );

      const saveGeneratedCode = await this.prisma.generatedCode.create({
        data: {
          title: payload.title,
          prompt: prompt,
          result: resultOfPrompt,
          total_used_words: wordCount,
          user_id: user.id,
        },
      });

      await createNewUsesHistory(
        user.id,
        coreConstant.AVAILABLE_FEATURES.CODE,
        payload.title,
        wordCount,
        0,
      );

      return successResponse('Generate Code successfully!', saveGeneratedCode);
    } catch (error) {
      processException(error);
    }
  }
  async transcriptionGenerateOpenAi(user: User, filePath: any) {
    try {
      const checkUserPackageResponse: any =
        await this.paymentService.checkSubscriptionStatus(user);

      if (checkUserPackageResponse.success === false) {
        return checkUserPackageResponse;
      }

      const userPackageData: any = checkUserPackageResponse.data;

      if (userPackageData.word_limit_exceed) {
        return errorResponse(
          'Your word limit exceeded; please purchase an additional package!',
        );
      }
      await this.openaiService.init();
      const responseOpenAi = await this.openaiService.transcriptionGenerate(
        filePath,
      );

      if (!responseOpenAi.text) {
        return errorResponse('Something went wrong!');
      }

      const wordCount = wordCountMultilingual(responseOpenAi.text);

      await this.paymentService.updateUserUsedWords(
        userPackageData.id,
        wordCount,
      );

      const saveGeneratedTranscription =
        await this.prisma.generatedTranscription.create({
          data: {
            result: responseOpenAi.text,
            total_used_words: wordCount,
            user_id: user.id,
          },
        });

      await createNewUsesHistory(
        user.id,
        coreConstant.AVAILABLE_FEATURES.CODE,
        responseOpenAi.text.slice(0, 10),
        wordCount,
        0,
      );

      if (responseOpenAi.text && filePath) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          } else {
            console.log('File deleted successfully:', filePath);
          }
        });
      }

      return successResponse(
        'Transcription generated successfully!',
        saveGeneratedTranscription,
      );
    } catch (error) {
      processException(error);
    }
  }
  async getGeneratedCsvListOfUser(user: User, payload: any) {
    try {
      const paginate = await paginatioOptions(payload);
      const whereClause = {
        user_id: user.id,
        OR: {
          title: {
            contains: payload.search ? payload.search : '',
          },
        },
      };

      const csvDocuments = await this.prisma.csvDocument.findMany({
        where: whereClause,
        ...paginate,
        orderBy: {
          created_at: 'desc',
        },
      });

      const paginationMeta = await paginationMetaData(
        'csvDocument',
        payload,
        whereClause,
      );

      const data = {
        list: csvDocuments,
        meta: paginationMeta,
      };
      return successResponse('Generated code list', data);
    } catch (error) {
      processException(error);
    }
  }
  async getGeneratedCodeListOfUser(user: User, payload: any) {
    try {
      const paginate = await paginatioOptions(payload);
      const whereClause = {
        user_id: user.id,
        OR: {
          title: {
            contains: payload.search ? payload.search : '',
          },
        },
      };

      const generatedCodeList = await this.prisma.generatedCode.findMany({
        where: whereClause,
        ...paginate,
      });

      const paginationMeta = await paginationMetaData(
        'generatedCode',
        payload,
        whereClause,
      );

      const data = {
        list: generatedCodeList,
        meta: paginationMeta,
      };
      return successResponse('Generated code list', data);
    } catch (error) {
      processException(error);
    }
  }

  async getGeneratedCodeDetails(id: number, user?: User) {
    try {
      const whereCondition = {
        id: id,
        ...(user && user.role === coreConstant.USER_ROLE_USER
          ? { user_id: user.id }
          : {}),
      };

      const generatedCodeDetails = await this.prisma.generatedCode.findFirst({
        where: whereCondition,
      });

      if (!generatedCodeDetails) {
        return errorResponse('Invalid request!');
      }
      return successResponse('Generated code details', generatedCodeDetails);
    } catch (error) {
      processException(error);
    }
  }
  async getGeneratedCsvDetails(id: number, user?: User) {
    try {
      const whereCondition = {
        id: id,
        ...(user && user.role === coreConstant.USER_ROLE_USER
          ? { user_id: user.id }
          : {}),
      };

      let generatedCodeDetails = await this.prisma.csvDocument.findFirst({
        where: whereCondition,
      });
      if (!generatedCodeDetails) {
        return errorResponse('Invalid request!');
      }
      return successResponse('Generated code details', generatedCodeDetails);
    } catch (error) {
      processException(error);
    }
  }
  async deleteTranscriptionDetails(id: number, user: User) {
    try {
      const whereCondition = {
        id: id,
        ...(user && user.role === coreConstant.USER_ROLE_USER
          ? { user_id: user.id }
          : {}),
      };
      const documentDetails =
        await this.prisma.generatedTranscription.findFirst({
          where: whereCondition,
        });

      if (!documentDetails) {
        return errorResponse('Invalid request!');
      }

      await this.prisma.generatedTranscription.delete({
        where: {
          id: documentDetails.id,
        },
      });

      return successResponse('Translated Document is deleted successfully!');
    } catch (error) {
      console.log(error, 'error');
      processException(error);
    }
  }
  async deleteGeneratedCode(id: number, user: User) {
    try {
      const whereCondition = {
        id: id,
        ...(user && user.role === coreConstant.USER_ROLE_USER
          ? { user_id: user.id }
          : {}),
      };
      const documentDetails = await this.prisma.generatedCode.findFirst({
        where: whereCondition,
      });

      if (!documentDetails) {
        return errorResponse('Invalid request!');
      }

      await this.prisma.generatedCode.delete({
        where: {
          id: documentDetails.id,
        },
      });

      return successResponse('Translated Document is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }
  async deleteGeneratedCsv(id: number, user: User) {
    try {
      const whereCondition = {
        id: id,
        ...(user && user.role === coreConstant.USER_ROLE_USER
          ? { user_id: user.id }
          : {}),
      };
      const documentDetails = await this.prisma.csvDocument.findFirst({
        where: whereCondition,
      });

      if (!documentDetails) {
        return errorResponse('Invalid request!');
      }

      await this.prisma.csvDocument.delete({
        where: {
          id: documentDetails.id,
        },
      });

      return successResponse('Translated Document is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }
  async updateDocumentByUser(user: User, payload: UpdateDocumentDto) {
    try {
      const documentDetails = await this.prisma.myDocuments.findFirst({
        where: {
          id: payload.document_id,
          user_id: user.id,
        },
      });

      if (!documentDetails) {
        return errorResponse('Invalid Request to save the document!');
      }

      await this.prisma.myDocuments.update({
        where: {
          id: documentDetails.id,
        },
        data: {
          title: payload.title,
          result: payload.result,
        },
      });

      return successResponse('Document is updated successfully!');
    } catch (error) {
      processException(error);
    }
  }

  async getAllLanguageList() {
    const languageList = LanguageListJsonArray;
    return successResponse('Language list', languageList);
  }

  async deleteDocument(id: number, user: User) {
    try {
      const whereCondition = {
        ...(user && user.role === coreConstant.USER_ROLE_USER
          ? { user_id: user.id }
          : {}),
      };
      const documentDetails = await this.prisma.myDocuments.findFirst({
        where: whereCondition,
      });

      if (!documentDetails) {
        return errorResponse('Invalid request!');
      }

      await this.prisma.myDocuments.delete({
        where: {
          id: id,
        },
      });

      return successResponse('Document is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }

  async textTranslate(user: User, payload: TextTranslateDto) {
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

      const prompt: string = await generatePromptForTranslate(
        payload.text,
        payload.language,
      );

      await this.openaiService.init();
      const responseOpenAi = await this.openaiService.textCompletion(
        prompt,
        1,
        userPackageData.model,
      );

      if (!responseOpenAi) {
        return errorResponse('Something went wrong!');
      }

      const resultOfPrompt = responseOpenAi.choices[0].message.content;
      const wordCount = wordCountMultilingual(resultOfPrompt);

      await this.paymentService.updateUserUsedWords(
        userPackageData.id,
        wordCount,
      );

      const saveGeneratedTranslation =
        await this.prisma.textTranslateDocument.create({
          data: {
            title: payload.title,
            text: payload.text,
            language: payload.language,
            prompt: prompt,
            result: resultOfPrompt,
            total_used_words: wordCount,
            user_id: user.id,
          },
        });

      await createNewUsesHistory(
        user.id,
        coreConstant.AVAILABLE_FEATURES.TRANSLATION,
        payload.title,
        wordCount,
        0,
      );
      return successResponse(
        'Generate Transaltion is done successfully!',
        saveGeneratedTranslation,
      );
    } catch (error) {
      processException(error);
    }
  }

  async generateJsonForCsv(user: User, payload: JsonGenerate) {
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

      const prompt: string = await generatePromptForJson(payload.topic);

      await this.openaiService.init();
      const responseOpenAi = await this.openaiService.textCompletionCustomToken(
        prompt,
        1,
        userPackageData.model,
        1000,
      );

      if (!responseOpenAi) {
        return errorResponse('Something went wrong!');
      }

      const resultOfPrompt = responseOpenAi.choices[0].message.content;
      const check = isValidArrayOfObjectsStringChecker(resultOfPrompt);
      if (check === false) {
        return errorResponse(
          'Our service is busy currently please try again later!',
        );
      }
      const wordCount = wordCountMultilingual(resultOfPrompt);

      await this.paymentService.updateUserUsedWords(
        userPackageData.id,
        wordCount,
      );

      await this.prisma.csvDocument.create({
        data: {
          title: payload.topic,
          result: resultOfPrompt,
          total_used_words: wordCount,
          topic: payload.topic,
          user_id: user.id,
        },
      });

      await createNewUsesHistory(
        user.id,
        coreConstant.AVAILABLE_FEATURES.TOPIC_TO_SPREDSHEET_GENERATOR,
        payload.topic,
        wordCount,
        0,
      );
      return successResponse('Data generated successfully!', resultOfPrompt);
    } catch (error) {
      processException(error);
    }
  }

  async getGeneratedTranslationList(user: User, payload: any) {
    try {
      const paginate = await paginatioOptions(payload);

      const whereCondition = {
        ...(user && user.role === coreConstant.USER_ROLE_USER
          ? { user_id: user.id }
          : {}),
        OR: {
          title: {
            contains: payload.search ? payload.search : '',
          },
        },
      };
      const generatedTranslationList =
        await this.prisma.textTranslateDocument.findMany({
          where: whereCondition,
          ...paginate,
        });

      const paginationMeta = await paginationMetaData(
        'textTranslateDocument',
        payload,
        whereCondition,
      );

      const data = {
        list: generatedTranslationList,
        meta: paginationMeta,
      };
      return successResponse('Generated translation list', data);
    } catch (error) {
      processException(error);
    }
  }

  async getGeneratedTranslationDetails(id: number, user: User) {
    try {
      const whereCondition = {
        id: id,
        ...(user && user.role === coreConstant.USER_ROLE_USER
          ? { user_id: user.id }
          : {}),
      };

      const generatedCodeDetails =
        await this.prisma.textTranslateDocument.findFirst({
          where: whereCondition,
        });

      if (!generatedCodeDetails) {
        return errorResponse('Invalid request!');
      }
      return successResponse(
        'Generated translation details',
        generatedCodeDetails,
      );
    } catch (error) {
      processException(error);
    }
  }

  async deleteGeneratedTranslation(id: number) {
    try {
      const translationDetails =
        await this.prisma.textTranslateDocument.findFirst({
          where: {
            id: id,
          },
        });

      if (!translationDetails) {
        return errorResponse('Invalid request!');
      }

      await this.prisma.textTranslateDocument.delete({
        where: {
          id: translationDetails.id,
        },
      });
      return successResponse('Generated translation is deleted successfully!');
    } catch (error) {
      processException(error);
    }
  }

  async getMyUsesHistoryList(user: User, payload: any) {
    try {
      const paginate = await paginatioOptions(payload);
      const whereCondition = {
        userId: user.id,
        OR: {
          title: {
            contains: payload.search ? payload.search : '',
          },
        },
      };

      const usesHistoryList = await this.prisma.usesHistory.findMany({
        where: whereCondition,
        ...paginate,
      });

      const paginationMeta = await paginationMetaData('usesHistory', payload);

      const data = {
        list: usesHistoryList,
        meta: paginationMeta,
      };
      return successResponse('My uses history list!', data);
    } catch (error) {
      processException(error);
    }
  }

  async getAllUserUsesHistory(payload: any) {
    try {
      const paginate = await paginatioOptions(payload);
      const whereClause = payload.search
        ? {
            User: {
              OR: [
                {
                  email: {
                    contains: payload.search,
                  },
                },
                {
                  phone: {
                    contains: payload.search,
                  },
                },
                {
                  first_name: {
                    contains: payload.search,
                  },
                },
                {
                  last_name: {
                    contains: payload.search,
                  },
                },
              ],
            },
          }
        : {};

      let usesHistoryList: any = await this.prisma.usesHistory.findMany({
        where: whereClause,
        include: {
          User: true,
        },
        ...paginate,
      });
      let updatedDAta = [];
      usesHistoryList.map((item) => {
        let data = item;
        data.User.photo = data.User?.photo
          ? addPhotoPrefix(data.User.photo)
          : null;
        updatedDAta.push(data);
      });

      const paginationMeta = await paginationMetaData(
        'usesHistory',
        payload,
        whereClause,
      );

      const data = {
        list: updatedDAta,
        meta: paginationMeta,
      };
      return successResponse('Uses history list!', data);
    } catch (error) {
      processException(error);
    }
  }

  async getAllActiveCategoryList(payload: any) {
    try {
      const categoryList = await this.prisma.templateCategory.findMany({
        where: {
          status: coreConstant.ACTIVE,
        },
      });

      return successResponse('Category List data', categoryList);
    } catch (error) {
      processException(error);
    }
  }
}
