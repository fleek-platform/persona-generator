import OpenAI from 'openai';
import { z } from 'zod';

import { systemRolePrompt } from '@base/prompts/index.js';

const ResponseSchema = z.object({
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

  async exec({
    content,
  }: {
    content: string;
  }): Promise<z.infer<typeof ResponseSchema>> {
    console.log(`[debug] src/index.ts: content = ${content}`)

    const parsedContent = contentSchema.safeParse(content);

    console.log(`[debug] src/index.ts: parsedContent.success = ${parsedContent.success}`)
    
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
}
