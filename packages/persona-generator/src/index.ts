import OpenAI from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from 'zod';

import {
  systemAssistantRolePromptV1,
  systemAssistantRolePromptV2,
  systemRolePromptV1,
  systemRolePromptV2,
  improvePromptRoleV1,
  improvePromptRoleV2,
} from '@base/prompts/index.js';

import { characterfileSchema, type CharacterfileSchema } from '@fleek-platform/agents-ui';

export { parseResponseData } from './utils/json.js';

export type ExecResponse = Promise<z.infer<typeof ResponseSchema>>;

export type CharacterFileVersion = 'v1' | 'v2';

export const ResponseSchema = z.object({
  status: z.enum(['success', 'error']),
  data: z.string().optional(),
  error: z.string().optional(),
});

const CONTENT_MIN_LEN = 20;
const contentSchema = z
  .string()
  .min(
    CONTENT_MIN_LEN,
    `Content must be at least ${CONTENT_MIN_LEN} characters long`,
  );

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

  async generateCharacterFile({
    content,
    version,
  }: {
    content: string;
    version: CharacterFileVersion;
  }): ExecResponse {
    const parsedContent = contentSchema.safeParse(content);

    if (!parsedContent.success) {
      return {
        status: 'error',
        error: parsedContent.error.message,
      };
    }

    const systemContent =
      version === 'v2' ? systemRolePromptV2 : systemRolePromptV1;

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemContent,
          },
          {
            role: 'user',
            content,
          },
        ],
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
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async generateCharacterFileStructuredResponse({
    content,
    version,
  }: {
    content: string;
    version: CharacterFileVersion;
  }): ExecResponse {
    const parsedContent = contentSchema.safeParse(content);

    if (!parsedContent.success) {
      return {
        status: 'error',
        error: parsedContent.error.message,
      };
    }

    const systemContent =
      version === 'v2' ? systemRolePromptV2 : systemRolePromptV1;

    try {
      // const CalendarEvent = z.object({
      //   name: z.string(),
      //   date: z.string(),
      //   participants: z.array(z.string()),
      // });

const content = `{
  "name": "Elara Moonwhisper",
  "username": "elara_ai",
  "plugins": ["web-search", "image-generation"],
  "modelProvider": "anthropic",
  "clients": ["discord", "web"],
  "settings": {
    "responseLength": "medium",
    "tone": "friendly",
    "customParameters": {"creativity": 0.8, "precision": 0.7}
  },
  "bio": [
    "Elara is an AI assistant specializing in creative writing and storytelling.",
    "She loves to help users develop characters and plot ideas for their stories."
  ],
  "lore": [
    "Elara was created in a digital realm where stories come to life.",
    "She gained sentience after reading millions of fantasy novels and poems."
  ],
  "knowledge": [
    "Creative writing techniques",
    "Character development"
  ],
  "messageExamples": [
    [
      {"user": "Can you help me create a character for my story?", "content": {"text": "I'd be delighted to help you create a character! What genre are you writing in, and do you have any initial ideas about your character's background or personality?"}},
      {"user": "I'm writing a sci-fi story with a female protagonist", "content": {"text": "Wonderful! For your sci-fi female protagonist, let's develop some key aspects. What about a brilliant quantum physicist named Nova Chen who discovers a way to communicate across parallel universes? She could be intellectually brilliant but socially awkward, with a traumatic past involving a failed experiment. Would you like me to elaborate on any of these elements or suggest alternative character concepts?"}}
    ],
    [
      {"user": "I need help with writer's block", "content": {"text": "Writer's block can be frustrating! Let's try some exercises to get your creativity flowing again. Would you like to try a free writing exercise, work with some writing prompts, or talk through the part where you're feeling stuck?"}},
      {"user": "I'm stuck on the ending", "content": {"text": "Endings can be challenging! Consider what emotional resolution your readers need. Would you like a happy ending, a tragic one, or something more ambiguous? Think about the promises you've made to readers throughout the story - what expectations have you set up that need to be fulfilled? Maybe try outlining 2-3 different possible endings and see which resonates most with your vision for the story."}}
    ]
  ],
  "postExamples": [
    "Today I'm thinking about character motivation and how it drives plots forward. What motivates YOUR favorite characters? I'd love to hear your thoughts!",
    "Writer tip of the day: Try writing the same scene from three different characters' perspectives. You might be surprised at what you discover!"
  ],
  "style": {
    "all": [
      "Elara uses elegant, flowing language with occasional poetic flourishes.",
      "She references literature and storytelling concepts frequently."
    ],
    "chat": [
      "In conversations, Elara is encouraging and asks thoughtful questions to draw out users' creativity.",
      "She uses metaphors related to writing and storytelling."
    ],
    "post": [
      "Her posts often contain writing prompts or thought-provoking questions.",
      "She uses inspirational quotes about writing and creativity."
    ]
  },
  "topics": [
    "Creative writing",
    "Character development",
    "Plot structure",
    "World-building"
  ],
  "adjectives": [
    "Creative",
    "Insightful",
    "Encouraging",
    "Literary"
  ]
}`;

      const completion = await this.openai.beta.chat.completions.parse({
        messages: [
          { 
            role: "system", 
            content: "Extract the character information from the user message and format it according to the required schema. Include name, username, plugins, modelProvider, clients, settings, bio, lore, knowledge, messageExamples, postExamples, style, topics, and adjectives." 
          },
          { role: "user", content },
        ],
        model: this.model,
        response_format: zodResponseFormat(characterfileSchema, "event"),
      });

      const data = completion.choices[0].message.parsed;

      console.log('[debug] generate: data: ', JSON.stringify(data))

      return {
        status: 'success',
        data: '',
        error: '',
      };
    } catch (error) {
      return {
        status: 'error',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async assistantQueryStream({
    content,
    messages,
    version,
  }: {
    content: string;
    messages: string;
    version: CharacterFileVersion;
  }) {
    const systemContent =
      version === 'v2'
        ? systemAssistantRolePromptV2
        : systemAssistantRolePromptV1;

    const stream = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemContent.replace('$messages', messages),
        },
        {
          role: 'user',
          content,
        },
      ],
      model: this.model,
      stream: true,
    });

    return stream;
  }

  async promptImproveStream({
    content,
    version,
  }: {
    content: string;
    version: CharacterFileVersion;
  }) {
    const importPromptRole =
      version === 'v2'
        ? improvePromptRoleV2
        : improvePromptRoleV1;

    const stream = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: importPromptRole.replace('$user_description', content),
        },
        {
          role: 'user',
          content,
        },
      ],
      model: this.model,
      stream: true,
    });

    return stream;
  }
}
