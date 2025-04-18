import OpenAI from 'openai';
import { z } from 'zod';

import { systemRolePrompt, systemRolePromptV2, systemAssistantRolePrompt, systemAssistantRolePromptV2 } from '@base/prompts/index.js';

export { parseResponseData } from './utils/json.js';

export type ExecResponse = Promise<z.infer<typeof ResponseSchema>>;

export const ResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  data: z.string().optional(),
  error: z.string().optional(),
});

const CONTENT_MIN_LEN = 20;
const contentSchema = z.string().min(CONTENT_MIN_LEN, `Content must be at least ${CONTENT_MIN_LEN} characters long`);

export class PersonaGenerator {
  private openai: OpenAI;
  private model: string;

  constructor({
      apiKey,
      baseURL,
      model,
    }: {
      apiKey: string;
      baseURL: string;
      model: string;
    }) {
    this.openai = new OpenAI({
      baseURL,
      apiKey,
    });

    this.model = model;
  }

  async generateCharacterfile({
    content,
  }: {
    content: string;
  }): ExecResponse {
    const parsedContent = contentSchema.safeParse(content);
    
    if (!parsedContent.success) {
      return {
        status: 'error',
        error: parsedContent.error.message,
      };
    }

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [{
          role: "system",
          content: systemRolePrompt,
        }, {
          role: 'user',
          content,    
        }],
        model: this.model,
      });

      const data = completion.choices[0].message.content || '';

      return {
        status: 'success',
        data,
        error: '',
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async generateCharacterfileV2({
    content,
  }: {
    content: string;
  }): ExecResponse {
    const parsedContent = contentSchema.safeParse(content);
    
    if (!parsedContent.success) {
      return {
        status: 'error',
        error: parsedContent.error.message,
      };
    }

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [{
          role: "system",
          content: systemRolePromptV2,
        }, {
          role: 'user',
          content,    
        }],
        model: this.model,
      });

      const data = completion.choices[0].message.content || '';

      return {
        status: 'success',
        data,
        error: '',
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async assistantQuery({
    content,
    messages,
  }: {
    content: string;
    messages: string;
  }): ExecResponse {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [{
          role: "system",
          content: systemAssistantRolePrompt.replace('$messages', messages),
        }, {
          role: 'user',
          content,    
        }],
        model: this.model,
      });

      const data = completion.choices[0].message.content || '';

      return {
        status: 'success',
        data,
        error: '',
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async assistantQueryStreamV2({
    content,
    messages,
  }: {
    content: string;
    messages: string;
  }) {    
    const stream = await this.openai.chat.completions.create({
      messages: [{
        role: "system",
        content: systemAssistantRolePromptV2.replace('$messages', messages),
      }, {
        role: 'user',
        content,    
      }],
      model: this.model,
      stream: true,
    });

    return stream;
  }

  async assistantQueryStream({
    content,
    messages,
  }: {
    content: string;
    messages: string;
  }) {    
    const stream = await this.openai.chat.completions.create({
      messages: [{
        role: "system",
        content: systemAssistantRolePrompt.replace('$messages', messages),
      }, {
        role: 'user',
        content,    
      }],
      model: this.model,
      stream: true,
    });

    return stream;
  }

  async generateCharacterfileStream({
    content,
  }: {
    content: string;
  }) {
    const parsedContent = contentSchema.safeParse(content);
    
    if (!parsedContent.success) {
      throw new Error(parsedContent.error.message);
    }

    const stream = await this.openai.chat.completions.create({
      messages: [{
        role: "system",
        content: systemRolePrompt,
      }, {
        role: 'user',
        content,    
      }],
      model: this.model,
      stream: true,
    });

    return stream;
  }
}
