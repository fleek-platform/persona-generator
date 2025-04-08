export type SubscriptionType = 'DEFAULT' | 'TEE';

export type AISubscriptionOptions = {
  name: string;
  cost: number;
  learnMoreLink?: string;
  disabled?: boolean;
};
