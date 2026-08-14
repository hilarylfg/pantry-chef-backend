import { tmpl } from './tmpl.js'

export interface ShoppingItem {
	name: string
	amount: number
	unit: string
	forRecipe?: string
}

export interface ShoppingListConstraints {
	recipes: string[]
	language?: string
}

export function buildShoppingListUserPrompt(
	neededItems: ShoppingItem[],
	constraints: ShoppingListConstraints,
	pantryItems?: ShoppingItem[]
): string {
	const neededLines = neededItems.map(n => {
		let line = `- ${n.name}: ${n.amount} ${n.unit}`
		if (n.forRecipe) {
			line += ` (для рецепта: ${n.forRecipe})`
		}
		return line
	})

	const pantryLines = pantryItems?.length
		? [
				'',
				'Уже есть в холодильнике:',
				...pantryItems.map(p => `- ${p.name}: ${p.amount} ${p.unit}`),
				''
			]
		: null

	const recipeNames = constraints.recipes.join(', ')

	return tmpl`
Список необходимых продуктов для покупки:
${neededLines}
${pantryLines}
Выбранные рецепты: ${recipeNames}
${constraints.language ? `Язык ответа: ${constraints.language}` : null}`
}
