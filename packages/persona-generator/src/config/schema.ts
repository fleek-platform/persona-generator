import { z } from 'zod';
import { CLIENT_NAMES } from './clients.js';
import { MODEL_PROVIDER_NAMES } from './modelProviders.js';

export const settingsSchema = z.object({
  secrets: z
    .record(z.string().min(1, 'value is missing'))
    .superRefine((secrets, ctx) => {
      // TODO: have a more explicit settings schema
      // to cover for all mapped secrets
      const twitterUsername = secrets.TWITTER_USERNAME;
      if (twitterUsername?.includes('@')) {
        ctx.addIssue({
          path: ['TWITTER_USERNAME'],
          message: "TWITTER_USERNAME: username handle must not contain '@'",
          code: z.ZodIssueCode.custom,
        });
      }
    }),
  voice: z.object({
    model: z.string().optional(),
  }),
  additionalSecrets: z
    .array(z.record(z.string().min(1, 'value is missing')))
    .optional(),
});

export type SettingsSchema = z.infer<typeof settingsSchema>;

export const characterfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().optional(),
  plugins: z.array(z.string()),
  settings: z.object({
    secrets: z.object({
      POST_IMMEDIATELY: z.string().default('true'),
      ENABLE_ACTION_PROCESSING: z.string().default('true'),
      MAX_ACTIONS_PROCESSING: z.string().default('10'),
      POST_INTERVAL_MAX: z.string().default('180'),
      POST_INTERVAL_MIN: z.string().default('90'),
      TWITTER_SPACES_ENABLE: z.string().default('false'),
      ACTION_TIMELINE_TYPE: z.string().default('foryou'),
      TWITTER_POLL_INTERVAL: z.string().default('120'),
    }).default({}),
    voice: z.object({
      model: z.string().default('en_GB-alan-medium'),
    }).default({}),
  }).default({}),
  bio: z.array(z.string().min(1, 'Bio is required')),
  lore: z.array(z.string().min(1, 'Lore is required')),
  knowledge: z.array(z.string()).optional(),
  messageExamples: z
    .array(
      z
        .array(
          z.object({
            user: z.string().min(1, 'User is required'),
            content: z.object({
              text: z.string(),
            }),
          }),
        )
        .min(2),
    )
    .min(1, 'At least one message example is required'),
  postExamples: z.array(z.string().min(1, 'Post example is required')),
  style: z.object({
    all: z.array(z.string().min(1, `Style for 'All' is required`)),
    chat: z.array(z.string().min(1, `Style for 'Chat' is required`)),
    post: z.array(z.string().min(1, `Style for 'Post' is required`)),
  }),
  topics: z.array(z.string().min(1)).min(1, 'At least one topic is required'),
  adjectives: z
    .array(z.string().min(1))
    .min(1, 'At least one adjective is required'),
});

export type CharacterfileSchema = z.infer<typeof characterfileSchema>;
