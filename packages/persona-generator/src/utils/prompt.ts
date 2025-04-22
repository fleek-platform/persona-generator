type StrictTerms = (typeof STRICT_TERMS)[number];

export const STRICT_TERMS = [
  'MUST',
  'STRICTLY',
  'REQUIRED',
  'MANDATORY',
  'ESSENTIAL',
  'WITHOUT EXCEPTION',
  'NO OTHER OPTION',
  'ONLY FROM',
  'LIMITED TO',
  'ALWAYS',
  'NEVER',
  'DO NOT',
  'PROHIBITED',
  'NO MORE THAN',
  'AT LEAST',
  'EXACTLY',
  'SPECIFICALLY',
  'CONSISTENT WITH',
  'BASED ON',
  'MATCHING',
  'WORD-FOR-WORD',
  'IN THE EXACT FORMAT',
  'IN THIS ORDER',
  'NO VARIATIONS',
  'EXCLUSIVE',
  'SELECT FROM',
  'CHOOSE ONLY FROM',
  'INCLUDE',
  'EXCLUDE',
  'MANDATED',
  'OBLIGATORY',
  'AS PROVIDED',
  'BASED SOLELY ON',
  'WITH NO ADDITIONS',
  'WITH NO OMISSIONS',
  'PRESERVE',
  'IDENTICAL TO',
  'UP TO A MAXIMUM OF',
  'NO LESS THAN',
  'FULLY COMPLIANT WITH',
  'IN STRICT COMPLIANCE',
  'IN ALIGNMENT WITH',
  'PER',
  'SHALL',
  'SHOULD NOT',
  'MUST STRICTLY',
  'FROM',
] as const;

const getTerm = <T extends StrictTerms>(opt: T) => opt;

export const strictlyMatchTermList = (list: readonly string[]) =>
  `<${getTerm('MUST')} match ${getTerm('ONLY FROM')} the following list: ${list.join(', ')}>`;

export const strictlyMatchTermListOrFallback = (
  list: readonly string[],
  name: string,
  fallback: string,
) =>
  `<${getTerm('MUST')} match ${getTerm('ONLY FROM')} the following list: ${list.join(', ')}. If a ${name} has not been provided fallback to ${fallback}>`;

export const pickMatchTermFromList = (
  list: readonly string[],
  requested: string,
  count: number,
) =>
  `<${getTerm('MUST STRICTLY')} find ${count} match for ${requested}, ${getTerm('FROM')} the following list: ${list.join(', ')}>`;

export const mandatoryBasedOnUserDescription = (
  term: string,
  count: number,
  context: string,
) =>
  `<${getTerm('MUST')} create a short ${term}, ${getTerm('NO MORE THAN')} ${count} words, ${getTerm('BASED SOLELY ON')} user requested ${context}>`;

export const fixedNumberExamplesOf = (
  min: number,
  max: number,
  description: string,
) =>
  `...<${getTerm('AT LEAST')} ${min}, ${getTerm('UP TO A MAXIMUM OF')} ${max}, ${getTerm('MUST')} be ${getTerm('BASED SOLELY ON')} ${description}>`;

export const someExamplesIncluding = (
  min: number,
  max: number,
  include: string,
) =>
  `...<${getTerm('AT LEAST')} ${min}, ${getTerm('UP TO A MAXIMUM OF')} ${max}, ${getTerm('MUST')} be ${getTerm('INCLUDE')} ${include}>`;

export const putUserTermOrCreateOne = (term: string, count: number) =>
  `<${getTerm('MUST')} use ${term} requested by user, if user failed to provide, ${getTerm('MUST')} create ${term}, ${getTerm('UP TO A MAXIMUM OF')} ${count} characters>`;

export const putAssistantTerm = (term: string) =>
  `<${getTerm('MUST')} use ${term} described by Assistant, if user failed to provide, ${getTerm('MUST')} create ${term}>`;

export const userInputIf = (key: string) =>
  `<If ${key} provided by user put it here, otherwise remove the property>`;

export const simulateInteraction = (description: string) =>
  `<${getTerm('MUST')} simulate ${description}>`;

export const ifMissingValueDefaultTo = (value: string) =>
  `<If provided by user put it here, otherwise default to ${value}. MUST respect the type ${typeof value}, e.g. string requires quotes>`;
