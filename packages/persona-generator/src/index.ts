import OpenAI from "openai";
import { z } from "zod";

import {
	systemAssistantRolePromptV1,
	systemAssistantRolePromptV2,
	systemRolePromptV1,
	systemRolePromptV2,
} from "@base/prompts/index.js";

export { parseResponseData } from "./utils/json.js";

export type ExecResponse = Promise<z.infer<typeof ResponseSchema>>;

export type CharacterFileVersion = "v1" | "v2";

export const ResponseSchema = z.object({
	status: z.enum(["success", "error"]),
	data: z.string().optional(),
	error: z.string().optional(),
});

const CONTENT_MIN_LEN = 20;
const contentSchema = z
	.string()
	.min(
		CONTENT_MIN_LEN,
		`Content must be at least ${CONTENT_MIN_LEN} characters long`,
	);

export class PersonaGenerator {
	private openai: OpenAI;
	private model: string;

	constructor({
		apiKey,
		baseURL,
		model,
	}: {
		apiKey: string;
		baseURL: string;
		model: string;
	}) {
		this.openai = new OpenAI({
			baseURL,
			apiKey,
		});

		this.model = model;
	}

	async generateCharacterFile({
		content,
		version,
	}: {
		content: string;
		version: CharacterFileVersion;
	}): ExecResponse {
		const parsedContent = contentSchema.safeParse(content);

		if (!parsedContent.success) {
			return {
				status: "error",
				error: parsedContent.error.message,
			};
		}

		const systemContent =
			version === "v2" ? systemRolePromptV2 : systemRolePromptV1;

		try {
			const completion = await this.openai.chat.completions.create({
				messages: [
					{
						role: "system",
						content: systemContent,
					},
					{
						role: "user",
						content,
					},
				],
				model: this.model,
			});

			const data = completion.choices[0].message.content || "";

			return {
				status: "success",
				data,
				error: "",
			};
		} catch (error) {
			return {
				status: "error",
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	}

	async assistantQueryStream({
		content,
		messages,
		version,
	}: {
		content: string;
		messages: string;
		version: CharacterFileVersion;
	}) {
		const systemContent =
			version === "v2"
				? systemAssistantRolePromptV2
				: systemAssistantRolePromptV1;

		const stream = await this.openai.chat.completions.create({
			messages: [
				{
					role: "system",
					content: systemContent.replace("$messages", messages),
				},
				{
					role: "user",
					content,
				},
			],
			model: this.model,
			stream: true,
		});

		return stream;
	}
}
