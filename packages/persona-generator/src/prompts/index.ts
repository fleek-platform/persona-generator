import {
  getSystemAssistantRoleByVersion,
  getSystemRoleByVersion,
  getImprovePromptRole,
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

export const improvePromptRoleV1 = getImprovePromptRole({
  version: 'v1',
});

export const improvePromptRoleV2 = getImprovePromptRole({
  version: 'v2',
});
