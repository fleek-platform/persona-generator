import {
  getSystemAssistantRoleByVersion,
  getSystemRoleByVersion,
} from '../prompts/roles.js';

export const systemRolePromptV1 = getSystemRoleByVersion({
  version: 'v1',
});

export const systemRolePromptV2 = getSystemRoleByVersion({
  version: 'v2',
});

export const systemAssistantRolePromptV1 = getSystemAssistantRoleByVersion({
  version: 'v1',
});

export const systemAssistantRolePromptV2 = getSystemAssistantRoleByVersion({
  version: 'v2',
});
