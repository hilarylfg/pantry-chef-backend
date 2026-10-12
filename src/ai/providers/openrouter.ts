import { ConfigService } from '@nestjs/config'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export type OpenRouterClient = ReturnType<typeof createOpenRouter>

export function createOpenRouterClient(
	config: ConfigService
): OpenRouterClient {
	return createOpenRouter({
		apiKey: config.getOrThrow<string>('OPENROUTER_API_KEY')
	})
}
