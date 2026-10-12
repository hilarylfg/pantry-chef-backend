/**
 * Значения по умолчанию. Переопределяются через .env:
 * AI_CHAT_MODEL, AI_RECIPE_MODEL, AI_VISION_MODEL.
 *
 * Это id моделей OpenRouter — при AI_PROVIDER=ollama задайте
 * свои модели (например `qwen3:4b`), локально установленные в Ollama.
 */

export const DEFAULT_CHAT_MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free'

export const DEFAULT_RECIPE_MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free'

export const DEFAULT_VISION_MODEL =
	'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'

export const DEFAULT_TEMPERATURE = 0.7
