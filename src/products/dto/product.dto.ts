import {
	IsIn,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min
} from 'class-validator'

import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '@/libs/common/types/product'

export class ProductDto {
	@IsString({ message: 'Название должно быть строкой.' })
	@IsNotEmpty({ message: 'Название обязательно для заполнения.' })
	name: string

	@IsString({ message: 'Категория должна быть строкой.' })
	@IsIn(PRODUCT_CATEGORIES, {
		message:
			'Некорректная категория. Допустимые значения: dairy, meat, vegetables и т.д.'
	})
	category: string

	@IsNumber({}, { message: 'Количество должно быть числом.' })
	@Min(0.01, { message: 'Количество должно быть больше 0.' })
	amount: number

	@IsString({ message: 'Единица измерения должна быть строкой.' })
	@IsIn(PRODUCT_UNITS, {
		message:
			'Некорректная единица измерения. Допустимые значения: g, kg, ml, l, piece и т.д.'
	})
	unit: string

	@IsOptional()
	@IsString({ message: 'Срок годности должен быть строкой в формате ISO.' })
	expiryDate?: string
}

export type ConsumeProductDto = Pick<ProductDto, 'amount'>
