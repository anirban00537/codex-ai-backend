import { Injectable, NotFoundException } from '@nestjs/common';
import Openai from 'openai';
import fs from 'fs';

import { SettingService } from '../admin/settings/settings.service';
import {
  countWords,
  getAdminSettingsData,
  wordCountMultilingual,
} from 'src/shared/helpers/functions';
import { OpenAISettingSlugs } from 'src/shared/constants/array.constants';
import { coreConstant } from 'src/shared/helpers/coreConstant';

@Injectable()
export class OpenAi {
  private openai: Openai;

  constructor() {}

  async init() {
    const response: any = await getAdminSettingsData(OpenAISettingSlugs);
    this.openai = new Openai({
      apiKey: response.open_ai_secret,
    });
  }
  async textCompletion(
    prompt: string,
    number_of_result: number,
    model_name: string,
  ): Promise<any> {
    const response: any = await getAdminSettingsData(OpenAISettingSlugs);
    const completion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: model_name ? model_name : 'gpt-3.5-turbo',
      temperature: Number(response?.open_ai_temperature)
        ? Number(response?.open_ai_temperature)
        : 0,
      max_tokens: Number(response?.open_ai_max_output_length)
        ? Number(response?.open_ai_max_output_length)
        : 20,
      n: Number(number_of_result),
    });
    return completion;
  }
  async textCompletionCustomToken(
    prompt: string,
    number_of_result: number,
    model_name: string,
    max_tokens:number,
  ): Promise<any> {
    const response: any = await getAdminSettingsData(OpenAISettingSlugs);
    const completion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: model_name ? model_name : 'gpt-3.5-turbo',
      temperature: Number(response?.open_ai_temperature)
        ? Number(response?.open_ai_temperature)
        : 0,
      max_tokens: max_tokens,
      n: Number(number_of_result),
    });
    return completion;
  }
  async imageGenerate(
    prompt: string,
    image_size: '256x256' | '512x512' | '1024x1024',
  ): Promise<Openai.Images.ImagesResponse> {
    const imageResponse = await this.openai.images.generate({
      prompt: prompt,
      size: image_size ? image_size : '256x256',
      response_format: 'b64_json',
    });

    return imageResponse;
  }
  async transcriptionGenerate(
    filePath: any,
  ): Promise<Openai.Audio.Transcriptions.Transcription> {
    try {
      const audioResponse = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
      });
      return audioResponse;
    } catch (error) {
      console.log(error);
    }
  }

  async chatCompletions(
    messages: [],
    number_of_result: number,
    model_name: string,
  ): Promise<any> {
    const response: any = await getAdminSettingsData(OpenAISettingSlugs);
    const completion = await this.openai.chat.completions.create({
      messages: messages,
      model: model_name ? model_name : 'gpt-3.5-turbo',
      temperature: Number(response?.open_ai_temperature)
        ? Number(response?.open_ai_temperature)
        : 0,
      max_tokens: Number(response?.open_ai_max_output_length)
        ? Number(response?.open_ai_max_output_length)
        : 20,
      n: Number(number_of_result),
    });
    return completion;
  }

  async listModels(): Promise<string[]> {
    const model = coreConstant.OPEN_AI_MODEL_NAMES;
    return model;
  }
}
