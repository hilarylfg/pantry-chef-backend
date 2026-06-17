import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'

import { StreamDto } from './dto/ai.dto'

const DEFAULT_MODEL = 'openrouter/owl-alpha'

@Injectable()
export class AiService {
	private readonly openrouter: ReturnType<typeof createOpenRouter>

	constructor(private readonly config: ConfigService) {
		this.openrouter = createOpenRouter({
			apiKey: this.config.getOrThrow<string>('OPENROUTER_API_KEY')
			// baseURL:
			// 	this.config.getOrThrow<string>('OPENROUTER_BASE_URL') ??
			// 	undefined
		})
	}

	streamChat(dto: StreamDto): ReturnType<typeof streamText> {
		const modelId = dto.model ?? DEFAULT_MODEL
		const messages = [{ role: 'user' as const, content: dto.prompt }]

		return streamText({
			model: this.openrouter(modelId),
			messages,
			temperature: 0.7
		})
	}
}
