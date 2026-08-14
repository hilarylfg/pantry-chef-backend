import { Product } from '../../generated/prisma/client.js'

import { daysLeft } from './days-left.js'
import { tmpl } from './tmpl.js'

export interface MealPlanConstraints {
	days: number
	mealsPerDay: number
	startDate: string
	maxPrepTimeMinutes: number
	variety: 'low' | 'medium' | 'high'
	leftovers: boolean
	budget: 'low' | 'medium' | 'high'
	diet?: string
	cuisinePreferences?: string
	weekDays: string[]
	language?: string
}

export function buildMealPlanUserPrompt(
	products: Product[],
	constraints: MealPlanConstraints
): string {
	const productLines = products.map(p => {
		let line = `- ${p.name}: ${p.amount} ${p.unit}`
		if (p.expiryDate) {
			line += ` (срок годности истекает через ${daysLeft(p.expiryDate)} дней)`
		}
		return line
	})

	const dayNames = constraints.weekDays.join(', ')

	return tmpl`
Твои доступные продукты:
${productLines}

Параметры плана питания:
- Количество дней: ${constraints.days}
- Приёмов пищи в день: ${constraints.mealsPerDay}
- Дата начала: ${constraints.startDate}
- Дни: ${dayNames}
- Максимальное время готовки в день: ${constraints.maxPrepTimeMinutes} минут
- Разнообразие: ${constraints.variety}
${constraints.leftovers ? '- Использовать остатки: да' : null}
- Бюджет: ${constraints.budget}
${constraints.diet ? `- Диета: ${constraints.diet}` : null}
${constraints.cuisinePreferences ? `- Предпочитаемые кухни: ${constraints.cuisinePreferences}` : null}
${constraints.language ? `- Язык ответа: ${constraints.language}` : null}

КРИТИЧЕСКИ: используй продукты с истекающим сроком в первую очередь.
${constraints.leftovers ? 'Планируй использовать остатки от предыдущих дней.' : null}
${constraints.diet ? `Строго соблюдай диету: ${constraints.diet}.` : null}`
}
