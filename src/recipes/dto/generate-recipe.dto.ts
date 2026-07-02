import { Type } from 'class-transformer'
import {
	IsBoolean,
	IsEnum,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
	Max,
	Min,
	ValidateNested
} from 'class-validator'

import { CUISINES, DIFFICULTIES, MEAL_TYPES } from '@/libs/common/types/product'

export class GenerateRecipeOptionsDto {
	@IsOptional()
	@IsNumber({}, { message: 'count должен быть числом.' })
	@Min(1, { message: 'count должен быть не меньше 1.' })
	@Max(10, { message: 'count должен быть не больше 10.' })
	count?: number

	@IsOptional()
	@IsBoolean({ message: 'includeShoppingList должен быть boolean.' })
	includeShoppingList?: boolean
}

export class GenerateRecipeDto {
	@IsOptional()
	@IsEnum(DIFFICULTIES, {
		message: 'difficulty должен быть одним из: easy, medium, hard.'
	})
	difficulty?: string

	@IsOptional()
	@IsEnum(CUISINES, {
		message:
			'cuisine должен быть одним из: italian, asian, russian, mexican, mediterranean, fusion, other.'
	})
	cuisine?: string

	@IsOptional()
	@IsEnum(MEAL_TYPES, {
		message:
			'mealType должен быть одним из: breakfast, lunch, dinner, snack.'
	})
	mealType?: string

	@IsOptional()
	@IsNumber({}, { message: 'maxTimeMinutes должен быть числом.' })
	@Min(5, { message: 'maxTimeMinutes должен быть не меньше 5.' })
	@Max(480, { message: 'maxTimeMinutes должен быть не больше 480.' })
	maxTimeMinutes?: number

	@IsOptional()
	@IsNumber({}, { message: 'servings должен быть числом.' })
	@Min(1, { message: 'servings должен быть не меньше 1.' })
	@Max(50, { message: 'servings должен быть не больше 50.' })
	servings?: number

	@IsOptional()
	@IsString({ message: 'diet должен быть строкой' })
	diet: string

	@IsOptional()
	@IsObject({ message: 'options должен быть объектом.' })
	@ValidateNested()
	@Type(() => GenerateRecipeOptionsDto)
	options?: GenerateRecipeOptionsDto
}
