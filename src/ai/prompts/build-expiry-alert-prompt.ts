import { Product } from '../../generated/prisma/client.js'

import { daysLeft } from './days-left.js'
import { tmpl } from './tmpl.js'

export interface ExpiryAlertConstraints {
	maxExpiryDays: number
	language?: string
}

export function buildExpiryAlertUserPrompt(
	expiringProducts: Product[],
	constraints: ExpiryAlertConstraints,
	otherProducts?: Product[]
): string {
	const expiringLines = expiringProducts.map(p => {
		const days = p.expiryDate ? daysLeft(p.expiryDate) : 0
		return `- ${p.name}: ${p.amount} ${p.unit} (осталось ${days} дней)`
	})

	const otherLines = otherProducts?.length
		? [
				'',
				'Остальные продукты в холодильнике:',
				...otherProducts.map(p => `- ${p.name}: ${p.amount} ${p.unit}`),
				''
			]
		: null

	return tmpl`
Список продуктов с истекающим сроком годности:
${expiringLines}
${otherLines}

Нужно составить план использования так, чтобы уложиться в ${constraints.maxExpiryDays} дней.
${constraints.language ? `Язык ответа: ${constraints.language}` : null}`
}
