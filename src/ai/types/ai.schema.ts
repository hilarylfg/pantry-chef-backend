import { z } from 'zod'

import {
	PRODUCT_CATEGORIES,
	PRODUCT_UNITS
} from '../../libs/common/types/product.js'

export const ProductCategoryEnum = z.enum(PRODUCT_CATEGORIES)

export const UnitEnum = z.enum(PRODUCT_UNITS)

export const DifficultyEnum = z.enum(['easy', 'medium', 'hard'])

// --- API Envelope (Стандартизируем ответы) ---
export const ApiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
	z.object({
		success: z.literal(true),
		data: dataSchema,
		meta: z.object({
			timestamp: z.iso.datetime(),
			pagination: z
				.object({
					cursor: z.string().optional(),
					hasMore: z.boolean().optional()
				})
				.optional()
		})
	})

export const ApiErrorSchema = z.object({
	success: z.literal(false),
	error: z.object({
		code: z.string(),
		message: z.string(),
		field: z.string().nullable()
	})
})

export const IngredientSchema = z.object({
	name: z.string().min(1).max(100),
	amount: z.number().positive(),
	unit: UnitEnum,
	fromPantry: z.boolean().default(false),
	pantryProductId: z.string().optional(),
	substitute: z.string().max(200).optional()
})

export const RecognizedProductSchema = z.object({
	name: z.string(),
	category: ProductCategoryEnum,
	amount: z.number(),
	unit: UnitEnum,
	confidence: z.number().min(0).max(1),
	estimatedExpiryDays: z.number().int(),
	needsConfirmation: z.boolean(),
	notes: z.string().optional()
})

export const LLMRecipeSchema = z.object({
	title: z.string().min(3).max(100),
	description: z.string().max(300),
	cuisine: z.string().optional(),
	difficulty: DifficultyEnum,
	prepTimeMinutes: z.number().int().positive(),
	cookTimeMinutes: z.number().int().positive(),
	servings: z.number().int().positive(),
	caloriesPerServing: z.number().int().positive().optional(),
	tags: z.array(z.string()).max(5).optional(),
	ingredients: z.array(IngredientSchema).min(1),
	steps: z
		.array(
			z.object({
				order: z.number().int().positive(),
				description: z.string().min(10).max(500),
				durationMinutes: z.number().int().min(0).optional(),
				tip: z.string().max(300).optional()
			})
		)
		.min(1),
	equipment: z.array(z.string()).optional()
})

export const RecipesSchema = z.object({
	recipes: z.array(LLMRecipeSchema)
})

export const GtinProductSchema = z.object({
	name: z.string().min(1, 'Название не должно быть пустым'),
	category: ProductCategoryEnum,
	amount: z.number().positive(),
	unit: UnitEnum
})

export const VisionResultSchema = z.object({
	products: z.array(RecognizedProductSchema).min(0)
})
