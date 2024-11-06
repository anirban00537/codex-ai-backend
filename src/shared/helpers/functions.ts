import { PrismaService } from '../../../src/modules/prisma/prisma.service';
import { ResponseModel } from '../models/response.model';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AdminSettings, Prisma, Template } from '@prisma/client';
const crypto = require('crypto');
import * as bcrypt from 'bcrypt';
import sharp from 'sharp';
import * as fs from 'fs';

import {
  CreativityKeyArray,
  OpenAiToneOfVoiceKeyArray,
  PaymentMethodRazorpaySettingsSlugs,
} from '../constants/array.constants';
import { coreConstant } from './coreConstant';
import path from 'path';
import { async } from 'rxjs';
export let app: NestExpressApplication;
export let PrismaClient: PrismaService;
export let myLogger;

export async function setApp(nestapp) {
  app = nestapp;

  PrismaClient = app.get(PrismaService);
  // myLogger = await app.resolve(MyLogger);
}
export function createUniqueCode() {
  let date = new Date().getTime();
  const id = crypto.randomBytes(10).toString('hex');
  const data = id + date;
  return data;
}
export function addPhotoPrefix(inputString: string): string {
  let prefix: string = process.env.BACKEND_URL;
  return `${prefix}${inputString}`;
}
export async function hashedPassword(password: string) {
  const saltOrRounds = 10;
  const hashPassword = await bcrypt.hash(password, saltOrRounds);
  return hashPassword;
}
export function wordCountMultilingual(inputString) {
  // Split the input string into words using Unicode properties
  const words = inputString
    .trim()
    .split(/[\p{White_Space}\p{Punctuation}]+/u)
    .filter(Boolean);

  // Return the count of words
  return words.length;
}

export function countWords(inputString) {
  const words = inputString.trim().split(/\s+/);

  return words.length;
}

export function processException(e) {
  checkPrismaError(e);
  if (
    (e.hasOwnProperty('response') &&
      !e.response.hasOwnProperty('success') &&
      !e.response.hasOwnProperty('data')) ||
    !e.hasOwnProperty('response')
  ) {
    // myLogger.error(e);
  }
  // throw e;
}
function checkPrismaError(e) {
  if (
    e instanceof Prisma.PrismaClientKnownRequestError ||
    e instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    // throw new Error('Something went wrong.');
    return errorResponse('Something went wrong.');
  }
}
export function successResponse(msg?: string, data?: object): ResponseModel {
  return {
    success: true,
    message: msg ?? 'Response Success!',
    data: data || null,
  };
}
export function errorResponse(msg?: string, data?: object): ResponseModel {
  return {
    success: false,
    message: msg ?? 'Response Error!',
    data: data || null,
  };
}

export function generateMailKey() {
  return generateNDigitNumber(6);
}

function generateNDigitNumber(n) {
  return Math.floor(
    Math.pow(10, n - 1) + Math.random() * 9 * Math.pow(10, n - 1),
  );
}

export function addDayWithCurrentDate(dayCount: number) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + dayCount);
  return currentDate;
}

export function clearTrailingSlash(str: string) {
  return str.replace(/\/$/, '');
}

export function exchange_app_url() {
  return clearTrailingSlash(process.env.EXCHANGE_APP_URL ?? '');
}

export function base_url() {
  return clearTrailingSlash(process.env.APP_URL ?? '');
}

export function envAppName() {
  return process.env.APP_NAME || '';
}

export async function appName(): Promise<string> {
  return process.env.APP_NAME || '';
}

export async function emailAppName(): Promise<string> {
  const app_name = await appName();
  return app_name ? '[' + app_name + ']' : '';
}
export function isArrayofObjects(arr) {
  if (!Array.isArray(arr)) {
    return false;
  }

  for (const element of arr) {
    if (
      typeof element !== 'object' ||
      element === null ||
      Array.isArray(element)
    ) {
      return false;
    }
  }

  return true;
}

export function isValidArrayOfObjectsStringChecker(jsonString) {
  try {
    const parsedData = JSON.parse(jsonString);
    console.log(parsedData, 'parsedData');
    if (!Array.isArray(parsedData)) {
      return false;
    }

    for (const element of parsedData) {
      if (
        typeof element !== 'object' ||
        element === null ||
        Array.isArray(element)
      ) {
        return false;
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

export async function formatLimitOffset(payload: any) {
  let limit = payload.limit ? Math.abs(parseInt(payload.limit)) : 10;
  let offset = payload.offset ? Math.abs(parseInt(payload.offset)) : 1;

  limit = isNaN(limit) ? 10 : limit;
  limit = limit > 0 ? limit : 10;

  offset = isNaN(offset) ? 1 : offset;
  offset = offset > 0 ? offset : 1;

  return {
    limit,
    offset,
  };
}

export async function paginatioOptions(payload: any) {
  const limitOffset = await formatLimitOffset(payload);
  const limit = limitOffset.limit;
  const offset = limitOffset.offset;
  let skip = 0;
  if (limit > 0 && offset > 0) {
    skip = (offset - 1) * limit;
  }

  const data = {
    skip,
    take: limit,
  };

  return data;
}
export function fileToBlob(file, callback) {
  const reader = new FileReader();

  reader.onload = function () {
    const blob = new Blob([reader.result], { type: file.type });
    callback(blob);
  };

  reader.onerror = function (error) {
    console.error('Error reading file:', error);
    callback(null);
  };

  reader.readAsArrayBuffer(file);
}

export async function saveAudioLocally(file: any, filePath: string) {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(file.buffer, 'base64'); // Convert from base64
    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(filePath);
      }
    });
  });
}

export async function paginationMetaData(
  model: string,
  payload: any,
  whereCondition = {},
) {
  const total = await PrismaClient[model].count({
    where: whereCondition,
  });

  const limitOffset = await formatLimitOffset(payload);

  const lastPage = Math.ceil(total / limitOffset.limit);
  const data = {
    total: total,
    lastPage: lastPage,
    currentPage: limitOffset.offset,
    perPage: limitOffset.limit,
    prev: limitOffset.offset > 1 ? limitOffset.offset - 1 : null,
    next: limitOffset.offset < lastPage ? limitOffset.offset + 1 : null,
  };

  return data;
}

export async function getAdminSettingsData(slugs?: any) {
  try {
    var data = {};

    if (Array.isArray(slugs)) {
      await Promise.all(
        slugs.map(async (slug) => {
          const slufInfo: any = await PrismaClient.adminSettings.findFirst({
            where: {
              slug: slug,
            },
          });

          if (slufInfo) {
            data[slug] = slufInfo.value;
          } else {
            data[slug] = null;
          }
        }),
      );
    } else if (typeof slugs === 'string') {
      const slufInfo = await PrismaClient.adminSettings.findFirst({
        where: {
          slug: slugs,
        },
      });
      data[slugs] = slufInfo.value;
    } else {
      const slugInfoList = await PrismaClient.adminSettings.findMany();
      slugInfoList.map((item) => {
        data[item.slug] = item.value;
      });
    }
    return data;
  } catch (error) {
    processException(error);
  }
}

export const fetchMyUploadFilePathById = async (uploadId: number) => {
  const uploadDetails = await PrismaClient.myUploads.findFirst({
    where: { id: uploadId },
  });
  return uploadDetails?.file_path || '';
};

export const adminSettingsValueBySlug = async (slug: string) => {
  const adminSettingsData = await PrismaClient.adminSettings.findFirst({
    where: {
      slug: slug,
    },
  });

  return adminSettingsData?.value;
};

export async function checkValidationForContentGenerateUseTemplate(
  payload: any,
): Promise<ResponseModel> {
  try {
    if (!payload.template_id || typeof payload.template_id !== 'number') {
      return errorResponse(
        !payload.template_id
          ? 'Please, Enter template id'
          : 'Template id must be a number!',
      );
    }

    const templateDetails = await PrismaClient.template.findFirst({
      where: { id: payload.template_id },
    });

    if (!templateDetails) {
      return errorResponse('Invalid template Id');
    }

    const prompt = templateDetails.prompt;

    const inputString = templateDetails.prompt_input;

    // Regular expression to match words enclosed in double asterisks
    const regex = /\*\*(.*?)\*\*/g;

    // Use the `match` method to find all matches
    const matches = inputString.match(regex); // Output: [ '**article_title**', '**focus_keywords**' ]

    // Now, you can further process the `matches` array to remove the asterisks and get the field names
    const fieldNames = matches.map((match) => match.replace(/\*\*/g, '')); // Output: [ 'article_title', 'focus_keywords' ]

    if (fieldNames.length > 0) {
      for (let i = 0; i < fieldNames.length; i++) {
        if (!payload[fieldNames[i]]) {
          return errorResponse(`Please, enter ${fieldNames[i]}`);
        }
      }
    }
    if (!payload.language) {
      return errorResponse('Please, Enter language');
    }

    if (
      !payload.maximum_length ||
      typeof payload.maximum_length !== 'number' ||
      payload.maximum_length <= 0
    ) {
      return errorResponse(
        !payload.maximum_length
          ? 'Please, Enter maximum length'
          : typeof payload.maximum_length !== 'number'
          ? 'Maximum length must be a valid number'
          : 'Maximum length must be a positive number',
      );
    }

    if (
      !payload.number_of_result ||
      typeof payload.number_of_result !== 'number' ||
      payload.number_of_result <= 0
    ) {
      return errorResponse(
        !payload.maximum_length
          ? 'Please, Enter number of result'
          : typeof payload.number_of_result !== 'number'
          ? 'Number of resut must be a valid number'
          : 'Number of resut must be a positive number',
      );
    }

    if (!payload.creativity) {
      return errorResponse('Please, Enter creativity');
    } else {
      if (typeof payload.creativity !== 'number') {
        return errorResponse('Creativity must be a number!');
      }
      if (!CreativityKeyArray.includes(payload.creativity)) {
        return errorResponse('Invalid creativity value');
      }
    }

    if (!payload.tone_of_voice) {
      return errorResponse('Please, Enter tone of voice');
    } else {
      if (typeof payload.tone_of_voice !== 'string') {
        return errorResponse('Tone of voice must be a string!');
      }
      if (!OpenAiToneOfVoiceKeyArray.includes(payload.tone_of_voice)) {
        return errorResponse('Invalid tone of voice value');
      }
    }

    return successResponse(
      'Content generate validation successful',
      templateDetails,
    );
  } catch (error) {
    processException(error);
  }
}

export async function setDynamicValueInPrompt(inputString, replacements) {
  // Define a regular expression to match placeholders like **placeholder**
  const placeholderRegex = /\*\*(.*?)\*\*/g;

  // Use the replace method with a function to perform replacements
  const firstPrompt = inputString.replace(
    placeholderRegex,
    (match: string, placeholder: string) => {
      // Check if the placeholder exists in the replacements object

      if (replacements.hasOwnProperty(placeholder)) {
        // If it exists, replace the placeholder with the corresponding value

        return replacements[placeholder];
      } else {
        // If it doesn't exist, leave the placeholder as is

        return match;
      }
    },
  );

  const secondPrompt = `Tone of voice must be ${replacements.tone_of_voice}, Language is ${replacements.language}, Maximum ${replacements.maximum_length} words. Creativity is ${replacements.creativity} between 0 and 1`;

  const finalPrompt = firstPrompt + secondPrompt;

  return finalPrompt;
}

export function calculatePrice(
  modelName: string,
  numWords: number,
  numImages: number,
): number {
  // Look up the model's pricing details
  const modelPricing = coreConstant.OPEN_AI_PRICING[modelName];

  if (!modelPricing) {
    // Model not found in pricing data
    throw new Error('Model not found in pricing data');
  }

  // Check if pricing data is available for words and images
  if (!modelPricing.wordPrice || !coreConstant.IMAGE_PRICE_PER_IMAGE) {
    throw new Error('Pricing data is incomplete');
  }

  // Calculate the price for words (tokens) if numWords is provided
  const wordPrice = numWords ? (numWords / 1000) * modelPricing.wordPrice : 0;

  // Calculate the price for images if numImages is provided
  const imagePrice = numImages
    ? numImages * coreConstant.IMAGE_PRICE_PER_IMAGE
    : 0;

  // Calculate the total price by adding word price and image price
  const totalPrice = wordPrice + imagePrice;

  return totalPrice;
}
const uploadDirectory = `./${coreConstant.FILE_DESTINATION}`;

export const saveBase64ImageAsJpg = (base64Image) => {
  return new Promise((resolve, reject) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = `${uniqueSuffix}.jpg`;
    const imagePath = path.join(uploadDirectory, fileName);

    const data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(data, 'base64');

    sharp(buffer)
      .jpeg({ quality: 80 })
      .toFile(imagePath, (err, info) => {
        if (err) {
          reject(err);
        } else {
          const imageUrl = `/${coreConstant.FILE_DESTINATION}/${fileName}`;
          resolve({ fileName, imageUrl });
          return imageUrl;
        }
      });
  });
};

export async function generatePromptForCode(
  description: string,
  codingLanguage: string,
  codingLevel: string,
): Promise<string> {
  const prompt = `Generate code for me for ${description} using ${codingLanguage} programing languages. The coding level must be ${codingLevel}`;

  return prompt;
}

export async function generatePromptForTranslate(
  text: string,
  language: string,
) {
  const prompt = `Please translate this text into ${language} language. My text is ${text}`;
  return prompt;
}
export async function generatePromptForJson(topic: string) {
  const prompt = `Please generate a json data only give me result of json. topic is ${topic} i need 5 data's, must provide an object in array and minimum 2 data in the array object's, Prepare data like this [
    {
      "key": "value",
      "key": "value",
      "key": "value"
    }
  ]`;
  return prompt;
}

export async function createNewUsesHistory(
  userId: number,
  usesType: number,
  title: string,
  usesWord: number,
  usesImage: number,
) {
  try {
    const newUses = await PrismaClient.usesHistory.create({
      data: {
        uses_type: usesType,
        title: title,
        uses_word: usesWord,
        uses_image: usesImage,
        userId: userId,
      },
    });
    return successResponse('New Uses history is created successfully!');
  } catch (error) {
    processException(error);
  }
}

export async function createSlug(categoryName): Promise<string> {
  // Remove leading and trailing white spaces
  categoryName = categoryName.trim();

  // Replace spaces with hyphens and convert to lowercase
  const slug = categoryName.replace(/\s+/g, '-').toLowerCase();

  return slug;
}
