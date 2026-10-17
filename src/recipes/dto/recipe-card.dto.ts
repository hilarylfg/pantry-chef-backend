import { Type } from 'class-transformer'
import {
	IsArray,
	IsBoolean,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested
} from 'class-validator'

import { Recipe } from '../../generated/prisma/client.js'
import { MatchStats } from '../utils/compute-match.js'

export class RecipeMissingIngredientDto {
	@IsString({ message: 'name должен быть строкой.' })
	name: string

	@IsOptional()
	@IsString({ message: 'substitute должен быть строкой.' })
	substitute?: string
}

export class RecipeMatchDto {
	@IsNumber({}, { message: 'matched должен быть числом.' })
	matched: number

	@IsNumber({}, { message: 'total должен быть числом.' })
	total: number

	@IsArray({ message: 'missing должен быть массивом.' })
	@ValidateNested({ each: true })
	@Type(() => RecipeMissingIngredientDto)
	missing: RecipeMissingIngredientDto[]
}

export class RecipeSaveDto {
	@IsString({ message: 'productId должен быть строкой.' })
	productId: string

	@IsString({ message: 'name должен быть строкой.' })
	name: string

	@IsNumber({}, { message: 'daysLeft должен быть числом.' })
	daysLeft: number
}

export class RecipeCardDto {
	@IsString({ message: 'id должен быть строкой.' })
	id: string

	@IsString({ message: 'title должен быть строкой.' })
	title: string

	@IsOptional()
	@IsNumber({}, { message: 'totalTimeMinutes должен быть числом.' })
	totalTimeMinutes?: number | null

	@IsOptional()
	@IsString({ message: 'imageUrl должен быть строкой.' })
	imageUrl?: string | null

	@IsBoolean({ message: 'isFavorite должно быть boolean.' })
	isFavorite: boolean

	@ValidateNested()
	@Type(() => RecipeMatchDto)
	match: RecipeMatchDto

	@IsArray({ message: 'saves должен быть массивом.' })
	@ValidateNested({ each: true })
	@Type(() => RecipeSaveDto)
	saves: RecipeSaveDto[]
}

export function toCardDto(recipe: Recipe, match: MatchStats): RecipeCardDto {
	const { prepTimeMinutes, cookTimeMinutes } = recipe

	return {
		id: recipe.id,
		title: recipe.title,
		totalTimeMinutes:
			prepTimeMinutes != null && cookTimeMinutes != null
				? prepTimeMinutes + cookTimeMinutes
				: null,
		imageUrl: recipe.imageUrl,
		isFavorite: recipe.isFavorite,
		match: {
			matched: match.matched,
			total: match.total,
			missing: match.missing
		},
		saves: match.saves
	}
}
