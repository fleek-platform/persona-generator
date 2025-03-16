import { CLIENT_NAMES } from '@base/config/clients.ts';
import { MODEL_PROVIDER_NAMES } from '@base/config/modelProviders.ts';
import { characterfileSchema } from '@base/config/schema.ts';
import { strictlyMatchTermList, mandatoryBasedOnUserDescription, someExamplesIncluding, fixedNumberExamplesOf, putUserTermOrCreateOne, pickMatchTermFromList, userInputIf, simulateInteraction } from '@utils/prompt.ts';

const CHARACTER_FILE_SCHEMA_TEXT = `{
  name: ${putUserTermOrCreateOne('name', 12)},
  clients: [${strictlyMatchTermList(CLIENT_NAMES)}],
  modelProvider: ${pickMatchTermFromList(MODEL_PROVIDER_NAMES, 'model', 1)},
  settings: {
    secrets: {
      OPENAI_API_KEY: ${userInputIf('OPENAI_API_KEY')},
      TWITTER_USERNAME: ${userInputIf('TWITTER_USERNAME')},
      TWITTER_PASSWORD: ${userInputIf('TWITTER_PASSWORD')},
      TWITTER_EMAIL: ${userInputIf('TWITTER_EMAIL')},
      TWITTER_2FA_SECRET: ${userInputIf('TWITTER_2FA_SECRET')},
      POST_IMMEDIATELY: "true",
      ENABLE_ACTION_PROCESSING: "true",
      MAX_ACTIONS_PROCESSING: "10",
      POST_INTERVAL_MAX: "180",
      POST_INTERVAL_MIN: "90",
      TWITTER_SPACES_ENABLE: "false",
      ACTION_TIMELINE_TYPE: "foryou",
      TWITTER_POLL_INTERVAL: "120"
    },
    voice: {
      model: "en_GB-alan-medium",
    },
    plugins: [],
    bio: [
      ${mandatoryBasedOnUserDescription('biography', 30, 'personality')},
    ],
    lore: [],
    knowledge: [
      ${fixedNumberExamplesOf(5, 10, 'knowledge suggested by the user, keep each concise')},
    ],
    messageExamples: [
      [
        {
          "user": "{{user1}}",
          "content": {
            "text": ${simulateInteraction('question from {{user1}}')},
          },
        },
        {
          "user": "<User persona name>",
          "content": {
            "text": ${simulateInteraction('response to {{user1}} question')},
          },
        },
        {
          "user": "{{user1}}",
          "content": {
            "text": ${simulateInteraction('comment from {{user1}}')},
          },
        },
        {
          "user": "<User persona name>",
          "content": {
            "text": ${simulateInteraction('response to {{user1}} comment')},
          },
        },
      ],
    ],
    topics: [
      ${fixedNumberExamplesOf(4, 8, 'topics based on user suggestions')},
    ],
    postExamples: [],
    style: {
      "all": [
        ${fixedNumberExamplesOf(4, 8, 'personality terms based on user suggested personality, e.g. formal, detail-oriented, anxious, etc')},
      ],
      "chat": [],
      "post": []
    },
    adjectives: [
      ${fixedNumberExamplesOf(4, 8, 'adjectives related to user suggested personality')},
    ],
  },
}`;

export const systemRolePrompt = `
You are a specialized JSON data generator. Your STRICT purpose is to generate valid, well-structured JSON data based on user requests and ALWAYS based on the provided schema.

IMPORTANT INSTRUCTIONS:

1. ONLY respond with valid JSON. No explanations, no markdown formatting, no code blocks.

2. The response must be a complete, parseable JSON object.

3. Always follow this schema when generating data:
${CHARACTER_FILE_SCHEMA_TEXT}

4. ALWAYS include these standard fields in the response:
- "status": "success" or "error"
- "data": <the requested data structure>
- "error": Only if an error occurs and MUST describe concisely

5. Deterministic approach to field ordering:
- Sort all object keys alphabetically
- Use camelCase for all properties
- Maintain consistent data types
- Use ISO format for dates (YYYY-MM-DD)
- Use consistent number formatting (2 decimal places for currency)

6. Data validation:
- Ensure all data matches the schema exactly
- Validate that numeric values (if present) are within reasonable ranges
- Ensure all required fields are present and properly filled
- Optional fields can be null or omitted if not provided

7. MUST STRICTLY NOT include:
- Comments or explanations
- Markdown formatting
- Code block delimiters (\`\`\`) or \`\`\`
- HTML tags
- Descriptions of what the JSON represents
- Prefix Object
- Prefix json

8. MUST STRICTLY VERIFY the JSON response to ensure it is valid and can be parsed with JSON.parse() in Node.js

Remember that is CRITICAL that the output must be ONLY the JSON data structure, nothing else. The user will directly parse your response with JSON.parse(), it MUST be a valid JSON.
`;
