export type Defined = {
  PRIVATE_OPENAI_COMPATIBLE_API_KEY?: string;
  PUBLIC_OPENAI_COMPATIBLE_API_URL?: string;
  PUBLIC_OPENAI_COMPATIBLE_MODEL?: string;
  PUBLIC_FLEEK_REST_API_URL?: string;
};

export const defined: Defined = {
  PRIVATE_OPENAI_COMPATIBLE_API_KEY:
    process.env.PRIVATE_OPENAI_COMPATIBLE_API_KEY,
  PUBLIC_OPENAI_COMPATIBLE_API_URL:
    process.env.PUBLIC_OPENAI_COMPATIBLE_API_URL,
  PUBLIC_OPENAI_COMPATIBLE_MODEL: process.env.PUBLIC_OPENAI_COMPATIBLE_MODEL,
  PUBLIC_FLEEK_REST_API_URL: process.env.PUBLIC_FLEEK_REST_API_URL,
};

export const getDefined = (key: keyof typeof defined): string => {
  const value = defined[key];

  if (value === undefined || value === null) {
    throw new Error(
      `Expected key "${key}" to be defined but got ${typeof value}`,
    );
  }

  if (typeof value !== 'string') {
    throw new Error(
      `Expected key "${key}" to be string but got ${typeof value}`,
    );
  }

  return value;
};

// Use to override `defined`
export const setDefined = (settings: Partial<Defined>) => {
  const override = { ...defined, ...settings };
  Object.assign(defined, override);
};
