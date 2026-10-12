import { ConfigService } from '@nestjs/config'
import { type LanguageModel } from 'ai'

import { createOllamaClient } from './ollama.js'
import { createOpenRouterClient } from './openrouter.js'

export const AI_CLIENT = Symbol('AI_CLIENT')

export type AiClient = (modelId: string) => LanguageModel

export const AiClientProvider = {
	provide: AI_CLIENT,
	inject: [ConfigService],
	useFactory: (config: ConfigService): AiClient => {
		const provider = (config.get<string>('AI_PROVIDER') ?? 'openrouter')
			.trim()
			.toLowerCase()

		switch (provider) {
			case 'openrouter':
				return createOpenRouterClient(config)
			case 'ollama':
				return createOllamaClient(config)
			default:
				throw new Error(
					`Неизвестный AI_PROVIDER: "${provider}". Доступные значения: openrouter, ollama.`
				)
		}
	}
}
