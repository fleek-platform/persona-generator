import {
  ChatSystemRoleNameForAgent,
  PLUGIN_NAMES as PLUGIN_NAMES_V1,
  PLUGIN_NAMES_V2,
  CLIENT_NAMES,
  MODEL_PROVIDER_NAMES,
} from '@fleek-platform/agents-ui';

import {
  fixedNumberExamplesOf,
  ifMissingValueDefaultTo,
  mandatoryBasedOnUserDescription,
  putAssistantTerm,
  simulateInteraction,
  strictlyMatchTermList,
  userInputIf,
  pickMatchTermFromList,
  strictlyMatchTermListOrFallback,
} from '../utils/prompt.js';

import type { CharacterFileVersion } from '../index.js';

export const requiredBaseCharacterFileDS = {
  name: '',
  settings: {
    secrets: {
      OPENAI_API_KEY: '',
      TWITTER_USERNAME: '',
      TWITTER_PASSWORD: '',
      TWITTER_EMAIL: '',
      TWITTER_2FA_SECRET: '',
      POST_IMMEDIATELY: '',
      ENABLE_ACTION_PROCESSING: '',
      MAX_ACTIONS_PROCESSING: '',
      POST_INTERVAL_MAX: '',
      POST_INTERVAL_MIN: '',
      TWITTER_SPACES_ENABLE: '',
      ACTION_TIMELINE_TYPE: '',
      TWITTER_POLL_INTERVAL: '',
    },
    voice: {
      model: '',
    },
  },
  plugins: [''],
  bio: [''],
  knowledge: [''],
  messageExamples: [
    [
      {
        name: '',
        content: {
          text: '',
        },
      },
      {
        name: '',
        content: {
          text: '',
        },
      },
    ],
  ],
  topics: [''],
  postExamples: [''],
  style: {
    all: [''],
    chat: [''],
    post: [''],
  },
  adjectives: [''],
};

const requiredV1CharacterFileDiffProps = {
  lore: [''],
  messageExamples: [
    [
      {
        user: '',
        content: {
          text: '',
        },
      },
      {
        user: '',
        content: {
          text: '',
        },
      },
    ],
  ],
  clients: [''],
  modelProvider: [''],
};

type RequiredCharacterFileDSVersions = CharacterFileVersion;

export type VersionParams = Record<'version', RequiredCharacterFileDSVersions>;

export type GetByVersionParams = VersionParams;

const getRequiredCharacterFileDS = ({ version }: GetByVersionParams) => {
  if (version === 'v1') {
    return {
      ...requiredBaseCharacterFileDS,
      ...requiredV1CharacterFileDiffProps,
    };
  }

  return requiredBaseCharacterFileDS;
};

export const getRequiredCharacterFileDSStringified = ({
  version,
}: GetByVersionParams) => {
  const data = getRequiredCharacterFileDS({ version });

  return JSON.stringify(data);
};

const getRequiredCharacterFileDSHintedBase = ({
  version,
}: GetByVersionParams) => {
  const baseHintedDS = {
    name: putAssistantTerm('name'),
    settings: {
      secrets: {
        OPENAI_API_KEY: userInputIf('OPENAI_API_KEY'),
        TWITTER_USERNAME: userInputIf('TWITTER_USERNAME'),
        TWITTER_PASSWORD: userInputIf('TWITTER_PASSWORD'),
        TWITTER_EMAIL: userInputIf('TWITTER_EMAIL'),
        TWITTER_2FA_SECRET: userInputIf('TWITTER_2FA_SECRET'),
        POST_IMMEDIATELY: ifMissingValueDefaultTo('true'),
        ENABLE_ACTION_PROCESSING: ifMissingValueDefaultTo('true'),
        MAX_ACTIONS_PROCESSING: ifMissingValueDefaultTo('10'),
        POST_INTERVAL_MAX: ifMissingValueDefaultTo('180'),
        POST_INTERVAL_MIN: ifMissingValueDefaultTo('90'),
        TWITTER_SPACES_ENABLE: ifMissingValueDefaultTo('false'),
        ACTION_TIMELINE_TYPE: ifMissingValueDefaultTo('foryou'),
        TWITTER_POLL_INTERVAL: ifMissingValueDefaultTo('120'),
      },
      voice: {
        model: 'en_GB-alan-medium',
      },
    },
    plugins: [
      strictlyMatchTermList(getListOfAvailablePlugins({ version: 'v2' })),
    ],
    bio: [mandatoryBasedOnUserDescription('biography', 15, 'personality')],
    knowledge: [
      fixedNumberExamplesOf(
        5,
        10,
        'knowledge suggested by the user, keep each concise',
      ),
    ],
    messageExamples: [
      [
        {
          name: '{{user1}}',
          content: {
            text: simulateInteraction('question from {{user1}}'),
          },
        },
        {
          name: ChatSystemRoleNameForAgent,
          content: {
            text: simulateInteraction('response to {{user1}} question'),
          },
        },
        {
          name: '{{user1}}',
          content: {
            text: simulateInteraction('comment from {{user1}}'),
          },
        },
        {
          name: ChatSystemRoleNameForAgent,
          content: {
            text: simulateInteraction('response to {{user1}} comment'),
          },
        },
      ],
    ],
    topics: [fixedNumberExamplesOf(4, 8, 'topics based on user suggestions')],
    postExamples: [fixedNumberExamplesOf(4, 8, 'post message examples')],
    style: {
      all: [
        fixedNumberExamplesOf(
          4,
          8,
          'personality terms based on user suggested personality, e.g. formal, detail-oriented, anxious, etc',
        ),
      ],
      chat: [fixedNumberExamplesOf(4, 8, 'chat moderation behaviour')],
      post: [fixedNumberExamplesOf(4, 8, 'post attitude')],
    },
    adjectives: [
      fixedNumberExamplesOf(
        4,
        8,
        'adjectives related to user suggested personality',
      ),
    ],
  };

  if (version === 'v1') {
    return {
      ...baseHintedDS,
      lore: [fixedNumberExamplesOf(4, 8, 'explain its purpose')],
      messageExamples: [
        [
          {
            user: '{{user1}}',
            content: {
              text: simulateInteraction('question from {{user1}}'),
            },
          },
          {
            user: ChatSystemRoleNameForAgent,
            content: {
              text: simulateInteraction('response to {{user1}} question'),
            },
          },
          {
            user: '{{user1}}',
            content: {
              text: simulateInteraction('comment from {{user1}}'),
            },
          },
          {
            user: ChatSystemRoleNameForAgent,
            content: {
              text: simulateInteraction('response to {{user1}} comment'),
            },
          },
        ],
      ],
      plugins: [],
      clients: [strictlyMatchTermListOrFallback(CLIENT_NAMES, 'clients', 'direct')],
      modelProvider: pickMatchTermFromList(MODEL_PROVIDER_NAMES, 'model', 1),
    };
  }

  return baseHintedDS;
};

const getRequiredCharacterFileDSHinted = ({ version }: GetByVersionParams) => {
  const characterFile = getRequiredCharacterFileDS({
    version,
  });

  const characterFileHinted = getRequiredCharacterFileDSHintedBase({
    version,
  });

  const characterFileWithHints = {
    ...characterFile,
    ...characterFileHinted,
  };

  return characterFileWithHints;
};

export const getRequiredCharacterFileDSHintedStringified = ({
  version,
}: GetByVersionParams) => {
  const data = getRequiredCharacterFileDSHinted({ version });

  return JSON.stringify(data);
};

const PluginVersion = {
  v1: PLUGIN_NAMES_V1,
  v2: PLUGIN_NAMES_V2,
};

export const getPluginNamesByVersion = ({ version }: GetByVersionParams) =>
  PluginVersion[version];

export const getListOfAvailablePlugins = ({ version }: GetByVersionParams) => {
  const data = getPluginNamesByVersion({
    version,
  });
  return data;
};
