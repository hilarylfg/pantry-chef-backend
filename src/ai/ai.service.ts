import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { Output, streamText } from 'ai'

import { LLMRecipeSchema } from '@/ai/types/ai.schema'

import { GenerateRecipeDto, StreamDto } from './dto/ai.dto'

const systemPrompt = `Ты — опытный шеф-повар и нутрициолог. Создавай рецепты из доступных ингредиентов.

ПРАВИЛА:
1. Используй ТОЛЬКО указанные ингредиенты. Допустимы: соль, перец, растительное масло, вода.
2. Не добавляй ингредиенты вне списка. Если чего-то не хватает — предложи замену или упрости рецепт.
3. Шаги должны быть атомарными: 1 действие = 1 шаг.
4. Указывай температуру (°C) и время там, где критично.
5. Давай практичные советы (tips) в ключевых шагах.
6. Время должно быть реалистичным для домашней кухни.
7. Сложность: easy (до 5 ингредиентов, 20 мин), medium (до 10, 40 мин), hard (сложная техника).

СТРУКТУРА ОТВЕТА:
{
  "title": "string (кратко, аппетитно)",
  "description": "string (1-2 предложения)",
  "cuisine": "italian|asian|russian|mexican|mediterranean|fusion|other",
  "difficulty": "easy|medium|hard",
  "prepTimeMinutes": number,
  "cookTimeMinutes": number,
  "servings": number,
  "caloriesPerServing": number (оценка),
  "tags": ["string"] (max 5),
  "ingredients": [
    {
      "name": "string",
      "amount": number,
      "unit": "g|kg|ml|l|tbsp|tsp|piece|cup|pinch",
      "fromPantry": boolean,
      "substitute": "string (optional)"
    }
  ],
  "steps": [
    {
      "order": number,
      "description": "string (конкретно, с температурой/временем)",
      "durationMinutes": number (optional),
      "tip": "string (optional, практический совет)"
    }
  ],
  "equipment": ["string"] (посуда/инструменты)
}

ЗАПРЕЩЕНО:
- Маркдаун, HTML, эмодзи в названиях
- Вводные фразы ("Вот рецепт...")
- Нереалистичные техники (су-вид без термостата)`

const DEFAULT_MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free'

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
		return this._streamChat(dto.model, dto.prompt, dto.temperature)
	}

	generateRecipe(dto: GenerateRecipeDto): ReturnType<typeof streamText> {
		return this._generateRecipe(dto.model, dto.prompt)
	}

	private _streamChat(
		model = DEFAULT_MODEL,
		prompt?: string,
		temperature = 0.7
	) {
		return streamText({
			model: this.openrouter(model),
			messages: [{ role: 'user', content: prompt ?? '' }],
			temperature
		})
	}

	private _generateRecipe(
		model: string,
		prompt: string
	): ReturnType<typeof streamText> {
		const modelId = model ?? DEFAULT_MODEL
		const messages = [
			{ role: 'system' as const, content: systemPrompt },
			{ role: 'user' as const, content: prompt }
		]

		return streamText({
			model: this.openrouter(modelId),
			output: Output.object({ schema: LLMRecipeSchema }),
			messages,
			temperature: 0.7
		})
	}
}
