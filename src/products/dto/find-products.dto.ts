import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator'

import {
	PRODUCT_CATEGORIES,
	PRODUCT_SORT_FIELDS,
	ProductCategory,
	ProductSortField,
	SORT_ORDERS,
	SortOrder
} from '../../libs/common/types/product'

export class FindProductsDto {
	@IsOptional()
	@IsIn(PRODUCT_CATEGORIES, {
		message: 'Некорректная категория.'
	})
	category: ProductCategory = 'dairy'

	@IsOptional()
	@IsIn(PRODUCT_SORT_FIELDS, {
		message: 'Некорректное поле сортировки.'
	})
	sort: ProductSortField = 'expiryDate'

	@IsOptional()
	@IsIn(SORT_ORDERS, {
		message: 'Порядок должен быть asc или desc.'
	})
	order: SortOrder = 'asc'

	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Страница должна быть целым числом.' })
	@Min(1, { message: 'Страница должна быть не меньше 1.' })
	page: number = 1

	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Лимит должен быть целым числом.' })
	@Min(1, { message: 'Лимит должен быть не меньше 1.' })
	@Max(100, { message: 'Лимит не может превышать 100.' })
	limit: number = 20
}
