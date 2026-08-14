import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { type z } from 'zod'

import {
	DEFAULT_CHAT_MODEL,
	DEFAULT_RECIPE_MODEL,
	DEFAULT_TEMPERATURE
} from './types/constants'
import { RECIPE_SYSTEM_PROMPT } from './types/prompts'

import { StreamDto } from './dto/chat.dto'
import { OPENROUTER_CLIENT, OpenRouterClient } from './providers/openrouter'

type AiModule = typeof import('ai')

const importEsm = new Function('id', 'return import(id)') as <T>(
	id: string
) => Promise<T>

@Injectable()
export class AiService implements OnModuleInit {
	private aiModule: AiModule | null = null

	constructor(
		@Inject(OPENROUTER_CLIENT)
		private readonly openrouter: OpenRouterClient
	) {}

	public async onModuleInit(): Promise<void> {
		this.aiModule = await importEsm<AiModule>('ai')
	}

	private get ai(): AiModule {
		if (!this.aiModule) {
			throw new Error('AI SDK module is not initialized')
		}
		return this.aiModule
	}

	public streamChat(dto: StreamDto): ReturnType<AiModule['streamText']> {
		return this.ai.streamText({
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
		const { output } = await this.ai.generateText({
			model: this.openrouter(options?.model ?? DEFAULT_RECIPE_MODEL),
			output: this.ai.Output.object({ schema: outputSchema }),
			instructions: options?.systemPrompt ?? RECIPE_SYSTEM_PROMPT,
			messages: [{ role: 'user', content: userPrompt }],
			temperature: options?.temperature ?? DEFAULT_TEMPERATURE
		})

		return output
	}
}
