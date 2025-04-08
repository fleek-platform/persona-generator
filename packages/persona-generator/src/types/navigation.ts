import type { TEMPLATES } from '@config/templates';
export type Template = (typeof TEMPLATES)[number];

export type NavigationState = {
  characterFile?: string;
  avatar?: string;
};
