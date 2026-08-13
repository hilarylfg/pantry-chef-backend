import { Injectable } from '@nestjs/common'

import { AiService } from '../ai/ai.service'
import {
	buildRecipeUserPrompt,
	RecipeConstraints
} from '../ai/prompts/build-recipe-prompt'
import { RecipesSchema } from '../ai/types/ai.schema'
import { Recipe } from '../generated/prisma/client'
import { RecipeSortField, SortOrder } from '../libs/common/types/product'
import { PrismaService } from '../prisma/prisma.service'
import { FindRecipesDto } from './dto/find-recipes.dto'
import { GenerateRecipeDto } from './dto/generate-recipe.dto'
import { UpdateRecipeDto } from './dto/update-recipe.dto'

@Injectable()
export class RecipesService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly aiService: AiService
	) {}

	public async findAllRecipes(
		userId: string,
		dto: FindRecipesDto
	): Promise<Recipe[]> {
		const skip = (dto.page - 1) * dto.limit

		return this.prismaService.recipe.findMany({
			where: { userId },
			orderBy: this.buildOrderBy(dto.sort, dto.order),
			skip,
			take: dto.limit
		})
	}

	public async findRecipeById(
		userId: string,
		recipeId: string
	): Promise<Recipe> {
		return this.prismaService.recipe.findFirst({
			where: {
				id: recipeId,
				userId
			}
		})
	}

	public async generateRecipe(userId: string, dto: GenerateRecipeDto) {
		const products = await this.prismaService.product.findMany({
			where: { userId }
		})

		const constraints: RecipeConstraints = {
			maxTimeMinutes: dto.maxTimeMinutes!,
			difficulty: dto.difficulty!,
			mealType: dto.mealType!,
			servings: dto.servings,
			cuisine: dto.cuisine,
			diet: dto.diet,
			options: {
				count: dto.options?.count,
				includeShoppingList: dto.options?.includeShoppingList
			}
		}

		const userPrompt = buildRecipeUserPrompt(products, constraints)
		const { recipes } = await this.aiService.generateStructured(
			userPrompt,
			RecipesSchema
		)

		await Promise.all(
			recipes.map(recipe =>
				this.prismaService.recipe.create({
					data: {
						title: recipe.title,
						ingredients: recipe.ingredients,
						steps: recipe.steps,
						userId
					}
				})
			)
		)

		return recipes
	}

	public async updateRecipe(
		userId: string,
		recipeId: string,
		dto: UpdateRecipeDto
	) {
		return this.prismaService.recipe.update({
			where: {
				id: recipeId,
				userId
			},
			data: {
				isFavorite: dto.isFavorite
			}
		})
	}

	public async deleteRecipe(userId: string, recipeId: string) {
		return this.prismaService.recipe.delete({
			where: {
				id: recipeId,
				userId
			}
		})
	}

	private buildOrderBy(
		sort?: RecipeSortField,
		order?: SortOrder
	): Record<string, SortOrder> {
		if (!sort || !order) return { createdAt: 'desc' }

		switch (sort) {
			case 'title':
				return { title: order }
			case 'favorite':
				return { favorite: order }
			default:
				return { createdAt: order }
		}
	}
}
