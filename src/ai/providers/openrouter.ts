import { ConfigService } from '@nestjs/config'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export const OPENROUTER_CLIENT = Symbol('OPENROUTER_CLIENT')

export type OpenRouterClient = ReturnType<typeof createOpenRouter>

export const OpenRouterProvider = {
	provide: OPENROUTER_CLIENT,
	inject: [ConfigService],
	useFactory: (config: ConfigService): OpenRouterClient => {
		return createOpenRouter({
			apiKey: config.getOrThrow<string>('OPENROUTER_API_KEY')
		})
	}
}
