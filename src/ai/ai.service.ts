import { Inject, Injectable } from '@nestjs/common'
import { generateText, Output, streamText } from 'ai'

import { RecipesSchema } from '@/ai/types/ai.schema'
import {
	DEFAULT_CHAT_MODEL,
	DEFAULT_RECIPE_MODEL,
	DEFAULT_TEMPERATURE
} from '@/ai/types/constants'
import { RECIPE_SYSTEM_PROMPT } from '@/ai/types/prompts'

import { StreamDto } from './dto/chat.dto'
import { OPENROUTER_CLIENT, OpenRouterClient } from './providers/openrouter'

@Injectable()
export class AiService {
	constructor(
		@Inject(OPENROUTER_CLIENT)
		private readonly openrouter: OpenRouterClient
	) {}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public streamChat(dto: StreamDto): any {
		return streamText({
			model: this.openrouter(dto.model ?? DEFAULT_CHAT_MODEL),
			messages: [{ role: 'user', content: dto.prompt }],
			temperature: dto.temperature ?? DEFAULT_TEMPERATURE
		})
	}

	public async generateRecipe(
		userPrompt: string,
		model = DEFAULT_RECIPE_MODEL,
		systemPrompt = RECIPE_SYSTEM_PROMPT,
		temperature = DEFAULT_TEMPERATURE
	) {
		const { output } = await generateText({
			model: this.openrouter(model),
			output: Output.object({ schema: RecipesSchema }),
			instructions: systemPrompt,
			messages: [{ role: 'user', content: userPrompt }],
			temperature
		})

		return output.recipes
	}
}
