import { Injectable } from '@nestjs/common'

import { AiService } from '../ai/ai.service.js'
import {
	buildRecipeUserPrompt,
	RecipeConstraints
} from '../ai/prompts/build-recipe-prompt.js'
import { RecipesSchema } from '../ai/types/ai.schema.js'
import { Recipe } from '../generated/prisma/client.js'
import { RecipeSortField, SortOrder } from '../libs/common/types/product.js'
import { PrismaService } from '../prisma/prisma.service.js'

import { FindRecipesDto } from './dto/find-recipes.dto.js'
import { FindRecommendationsDto } from './dto/find-recommendations.dto.js'
import { GenerateRecipeDto } from './dto/generate-recipe.dto.js'
import { RecipeCardDto, toCardDto } from './dto/recipe-card.dto.js'
import { UpdateRecipeDto } from './dto/update-recipe.dto.js'
import { computeMatch, MatchStats } from './utils/compute-match.js'

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
		const [products, excludedRecipes] = await Promise.all([
			this.prismaService.product.findMany({
				where: { userId }
			}),
			dto.excludeIds?.length
				? this.prismaService.recipe.findMany({
						where: { id: { in: dto.excludeIds }, userId },
						select: { title: true }
					})
				: Promise.resolve<{ title: string }[]>([])
		])

		const constraints: RecipeConstraints = {
			maxTimeMinutes: dto.maxTimeMinutes,
			difficulty: dto.difficulty,
			mealType: dto.mealType,
			servings: dto.servings,
			cuisine: dto.cuisine,
			diet: dto.diet,
			excludeTitles: excludedRecipes.map(r => r.title),
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

		const savedRecipes = await Promise.all(
			recipes.map(r =>
				this.prismaService.recipe.create({
					data: {
						title: r.title,
						description: r.description,
						cuisine: r.cuisine,
						difficulty: r.difficulty,
						prepTimeMinutes: r.prepTimeMinutes,
						cookTimeMinutes: r.cookTimeMinutes,
						servings: r.servings,
						caloriesPerServing: r.caloriesPerServing,
						tags: r.tags ?? [],
						ingredients: r.ingredients,
						steps: r.steps,
						userId
					}
				})
			)
		)

		return savedRecipes.map(recipe =>
			toCardDto(recipe, computeMatch(recipe.ingredients, products))
		)
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

	public async getRecommendations(
		userId: string,
		dto: FindRecommendationsDto
	): Promise<RecipeCardDto[]> {
		const [products, recipes] = await Promise.all([
			this.prismaService.product.findMany({ where: { userId } }),
			this.prismaService.recipe.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
				take: 30
			})
		])

		return recipes
			.map(r => ({
				recipe: r,
				match: computeMatch(r.ingredients, products)
			}))
			.filter(
				({ match }) =>
					match.total > 0 && match.matched / match.total >= 0.5
			)
			.sort((a, b) => this.score(b.match) - this.score(a.match))
			.slice(0, dto.count)
			.map(({ recipe, match }) => toCardDto(recipe, match))
	}

	private score({ matched, total, saves }: MatchStats): number {
		return matched / total + saves.length * 2
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
				return { isFavorite: order }
			default:
				return { createdAt: order }
		}
	}
}
