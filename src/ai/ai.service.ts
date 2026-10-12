import {
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { generateText, Output, streamText } from 'ai'
import { type z } from 'zod'

import { StreamDto } from './dto/chat.dto.js'
import { AI_CLIENT, AiClient } from './providers/ai-client.js'
import {
	DEFAULT_CHAT_MODEL,
	DEFAULT_RECIPE_MODEL,
	DEFAULT_TEMPERATURE
} from './types/constants.js'
import { RECIPE_SYSTEM_PROMPT } from './types/prompts.js'

@Injectable()
export class AiService {
	private readonly logger = new Logger(AiService.name)

	constructor(
		@Inject(AI_CLIENT)
		private readonly aiClient: AiClient,
		private readonly configService: ConfigService
	) {}

	public streamChat(dto: StreamDto): ReturnType<typeof streamText> {
		return streamText({
			model: this.aiClient(
				dto.model ??
					this.configService.get<string>('AI_CHAT_MODEL') ??
					DEFAULT_CHAT_MODEL
			),
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
		try {
			const { output } = await generateText({
				model: this.aiClient(
					options?.model ??
						this.configService.get<string>('AI_RECIPE_MODEL') ??
						DEFAULT_RECIPE_MODEL
				),
				output: Output.object({ schema: outputSchema }),
				instructions: options?.systemPrompt ?? RECIPE_SYSTEM_PROMPT,
				messages: [{ role: 'user', content: userPrompt }],
				temperature: options?.temperature ?? DEFAULT_TEMPERATURE
			})

			return output
		} catch (error) {
			// NoOutputGeneratedError не содержит причины — логируем, чем закончила модель.
			const detail = error as {
				name?: string
				message?: string
				finishReason?: string
				text?: string
			}
			this.logger.error(
				`Structured generation failed: ${JSON.stringify({
					name: detail.name,
					message: detail.message,
					finishReason: detail.finishReason,
					textHead:
						typeof detail.text === 'string'
							? detail.text.slice(0, 200)
							: undefined
				})}`
			)

			throw new InternalServerErrorException(
				'Модель не смогла сформировать ответ. Попробуйте еще раз или уменьшите объем запроса.'
			)
		}
	}
}
