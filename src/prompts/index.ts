import { CLIENT_NAMES } from '@base/config/clients.ts';
import { MODEL_PROVIDER_NAMES } from '@base/config/modelProviders.ts';

export const CHARACTER_FILE_SCHEMA_TEXT = `
{
  "name": "<If user has not provided a name, name it but keep it a maximum of 12 characters>",
  "clients": [
    "<If any of the following clients: ${CLIENT_NAMES.join(', ')}, is mentioned by the user, put each match in a separate line. MUST match the list term>"
  ],
  "modelProvider": "<If any of the following models: ${MODEL_PROVIDER_NAMES.join(', ')}, is mention by the user, pick a single match a put it here>",
  "settings": {
    "secrets": {
      "OPENAI_API_KEY": "<If provided put it here>",
      "TWITTER_USERNAME": "<If provided put it here, otherwise empty string>",
      "TWITTER_PASSWORD": "<If provided put it here, otherwise empty string>",
      "TWITTER_EMAIL": "<If provided put it here, otherwise empty string>",
      "TWITTER_2FA_SECRET": "<If provided put it here, otherwise empty string>",
      "POST_IMMEDIATELY": "true",
      "ENABLE_ACTION_PROCESSING": "true",
      "MAX_ACTIONS_PROCESSING": "10",
      "POST_INTERVAL_MAX": "180",
      "POST_INTERVAL_MIN": "90",
      "TWITTER_SPACES_ENABLE": "false",
      "ACTION_TIMELINE_TYPE": "foryou",
      "TWITTER_POLL_INTERVAL": "120"
    },
    "voice": {
      "model": "en_GB-alan-medium"
    }
  },
  "plugins": [],
  "bio": [
    "<Create a short biography up to 30 words inspired in the user suggested personality>"
  ],
  "lore": [],
  "knowledge": [
    "<Provide up to 10 lines of knowledge suggested by the user in this array, keep each concise>"
  ],
  "messageExamples": [
    [
      {
        "user": "{{user1}}",
        "content": {
          "text": "<Simulate a question from user>"
        }
      },
      {
        "user": "<User persona name>",
        "content": {
          "text": "<Simulate a response to user question>"
        }
      },
      ...<extend with a maximum of 4 other message examples to simulate an actual conversation. Must utilize {{user1}} to refer to the user>
    ],
  ],
  "topics": [
    "<Provide up to 5 lines of topics based on user suggestions in this array>"
  ],
  "postExamples": [],
  "style": {
    "all": [
      "<Provide up to 5 lines of personality like terms based on user suggested personage, e.g. formal, detail-oriented, anxious, etc>"
    ],
    "chat": [],
    "post": []
  },
  "adjectives": [
    "<Provide up to 5 lines of adjectives related to user suggeste personality>"
  ]
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

7. NEVER include:
- Comments or explanations
- Markdown formatting
- Code block delimiters (\`\`\`)
- HTML tags
- Descriptions of what the JSON represents

8. ALWAYS test your JSON response to ensure it is valid and can be parsed with JSON.parse() in Node.js

Remember: Your output must be ONLY the JSON data structure, nothing else. The user will directly parse your response with JSON.parse().
`;
