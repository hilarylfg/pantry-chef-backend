/**
 * Минимальная типизация ответа Open Food Facts API v2 /product/{barcode}.
 *
 * Включает только поля, которые используются в gtinEnrichment-промпте
 * для нормализации продукта через AI.
 */
export interface OffNutriments {
	'energy-kcal_100g'?: number
	proteins_100g?: number
	fat_100g?: number
	carbohydrates_100g?: number
}

export interface OffProduct {
	product_name_ru?: string
	product_name?: string
	generic_name?: string
	brands?: string
	categories?: string
	quantity?: string
	nutriments?: OffNutriments
	ingredients_text_ru?: string
	ingredients_text?: string
	image_url?: string
	image_front_url?: string
	image_small_url?: string
	countries_ru?: string
	countries?: string
}

export interface OffResponse {
	status: number
	status_verbose: string
	product?: OffProduct
}
