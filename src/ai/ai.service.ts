import { Inject, Injectable } from '@nestjs/common'
import { generateText, Output, streamText } from 'ai'
import { type z } from 'zod'

import { StreamDto } from './dto/chat.dto.js'
import { OPENROUTER_CLIENT, OpenRouterClient } from './providers/openrouter.js'
import {
	DEFAULT_CHAT_MODEL,
	DEFAULT_RECIPE_MODEL,
	DEFAULT_TEMPERATURE
} from './types/constants.js'
import { RECIPE_SYSTEM_PROMPT } from './types/prompts.js'

@Injectable()
export class AiService {
	constructor(
		@Inject(OPENROUTER_CLIENT)
		private readonly openrouter: OpenRouterClient
	) {}

	public streamChat(dto: StreamDto): ReturnType<typeof streamText> {
		return streamText({
			model: this.openrouter(dto.model ?? DEFAULT_CHAT_MODEL),
			messages: [{ role: 'user', content: dto.prompt }],
			temperature: dto.temperature ?? DEFAULT_TEMPERATURE
		})
	}

	public async generateStructured<T>(
		userPrompt: string,
		outputSchema: z.ZodType<T>,
		options?: {
			model?: string
			systemPrompt?: string
			temperature?: number
		}
	): Promise<T> {
		const { output } = await generateText({
			model: this.openrouter(options?.model ?? DEFAULT_RECIPE_MODEL),
			output: Output.object({ schema: outputSchema }),
			instructions: options?.systemPrompt ?? RECIPE_SYSTEM_PROMPT,
			messages: [{ role: 'user', content: userPrompt }],
			temperature: options?.temperature ?? DEFAULT_TEMPERATURE
		})

		return output
	}
}
