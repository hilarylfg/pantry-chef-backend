import { Product } from '@/generated/prisma/client'

import { tmpl } from './tmpl'

export interface RecipeConstraints {
	maxTimeMinutes: number
	difficulty: string
	mealType: string
	servings?: number
	cuisine?: string
	diet?: string
	language?: string
	equipment?: string[]
	options: {
		count?: number
		includeShoppingList?: boolean
	}
}

export function buildRecipeUserPrompt(
	products: Product[],
	constraints: RecipeConstraints
): string {
	const productLines = products.map(p => {
		let line = `- ${p.name}: ${p.amount} ${p.unit}`

		if (p.expiryDate) {
			line += ` (срок годности истекает через ${p.expiryDate} дней — используй в первую очередь)`
		}

		return line
	})

	const equipmentStr = constraints.equipment?.length
		? constraints.equipment.join(', ')
		: null

	return tmpl`
Доступные ингредиенты (используй ТОЛЬКО их):
${productLines}
Параметры рецепта:
- Максимальное время приготовления: ${constraints.maxTimeMinutes} минут
- Сложность: ${constraints.difficulty}
- Тип приема пищи: ${constraints.mealType}
${constraints.servings ? `- Количество порций: ${constraints.servings}` : null}
${constraints.cuisine ? `- Предпочитаемая кухня: ${constraints.cuisine}` : null}
${constraints.diet ? `- Диета пользователя: ${constraints.diet}` : null}
${constraints.language ? `- Язык ответа: ${constraints.language}` : null}
${equipmentStr ? `- Доступное оборудование: ${equipmentStr}` : null}

Количество рецептов: ${constraints.options.count ?? 1}
ПРИОРИТЕТ: используй продукты с истекающим сроком в первую очередь.
${equipmentStr ? 'Если рецепт требует оборудования вне списка — предложи альтернативу или упрости.' : null}`
}
