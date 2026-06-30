export const PRODUCT_CATEGORIES = [
	'dairy',
	'meat',
	'poultry',
	'fish',
	'seafood',
	'eggs',
	'vegetables',
	'fruits',
	'grains',
	'pasta',
	'bread',
	'bakery',
	'canned',
	'frozen',
	'spices',
	'oils',
	'sauces',
	'beverages',
	'snacks',
	'sweets',
	'other'
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const PRODUCT_UNITS = [
	'g',
	'kg',
	'ml',
	'l',
	'tbsp',
	'tsp',
	'piece',
	'cup',
	'pinch',
	'pack',
	'bottle',
	'jar'
] as const

export type ProductUnit = (typeof PRODUCT_UNITS)[number]

export const PRODUCT_SORT_FIELDS = [
	'expiryDate',
	'createdAt',
	'name',
	'amount',
	'unit',
	'category'
] as const

export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number]

export const SORT_ORDERS = ['asc', 'desc'] as const

export type SortOrder = (typeof SORT_ORDERS)[number]
