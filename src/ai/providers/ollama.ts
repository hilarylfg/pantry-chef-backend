import { ConfigService } from '@nestjs/config'
import { type LanguageModel } from 'ai'
import { createOllama } from 'ollama-ai-provider-v2'

export type OllamaClient = (modelId: string) => LanguageModel

const DEFAULT_NUM_CTX = 16384

export function createOllamaClient(config: ConfigService): OllamaClient {
	const numCtx =
		Number(config.get<string>('OLLAMA_NUM_CTX')) || DEFAULT_NUM_CTX

	const ollama = createOllama({
		baseURL: config.get<string>('OLLAMA_BASE_URL'),

		fetch: async (
			input: string | URL | Request,
			init?: RequestInit
		): Promise<Response> => {
			if (typeof init?.body === 'string') {
				try {
					const body = JSON.parse(init.body) as Record<
						string,
						unknown
					>
					const options = (body.options ?? {}) as Record<
						string,
						unknown
					>
					body.options = { num_ctx: numCtx, ...options }
					init = { ...init, body: JSON.stringify(body) }
				} catch {
					// Тело не JSON — отправляем как есть.
				}
			}

			return fetch(input, init)
		}
	})

	return (modelId: string) => ollama(modelId) as unknown as OllamaClient
}
