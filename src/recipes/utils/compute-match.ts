import { Product } from '../../generated/prisma/client.js'
import { SAVES_SOON_DAYS } from '../../products/products.service.js'

export interface MissingIngredient {
	name: string
	substitute?: string
}

export interface SaveProduct {
	productId: string
	name: string
	daysLeft: number
}

export interface MatchStats {
	total: number
	matched: number
	missing: MissingIngredient[]
	saves: SaveProduct[]
}

export function normalizeName(name: string): string {
	return name.trim().toLowerCase().replace(/ё/g, 'е')
}

export function computeMatch(
	ingredients: unknown,
	products: Product[]
): MatchStats {
	const items = (Array.isArray(ingredients) ? ingredients : []) as {
		name: string
		substitute?: string
	}[]
	const byName = new Map(products.map(p => [normalizeName(p.name), p]))

	const missing: MissingIngredient[] = []
	const saves: SaveProduct[] = []
	let matched = 0
	for (const ing of items) {
		const product = byName.get(normalizeName(ing.name))
		if (!product) {
			missing.push({ name: ing.name, substitute: ing.substitute })
			continue
		}
		matched++
		if (product.expiryDate) {
			const days = Math.max(
				0,
				Math.ceil(
					(product.expiryDate.getTime() - Date.now()) / 86_400_000
				)
			)
			if (days <= SAVES_SOON_DAYS)
				saves.push({
					productId: product.id,
					name: product.name,
					daysLeft: days
				})
		}
	}
	return { total: items.length, matched, missing, saves }
}
