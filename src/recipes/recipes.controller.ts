import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post
} from '@nestjs/common'

import { Authorization } from '../auth/decorators/auth.decorator'
import { Authorized } from '../auth/decorators/authorized.decorator'
import { FindRecipesDto } from './dto/find-recipes.dto'
import { GenerateRecipeDto } from './dto/generate-recipe.dto'
import { UpdateRecipeDto } from './dto/update-recipe.dto'

import { RecipesService } from './recipes.service'

@Controller('recipes')
export class RecipesController {
	constructor(private readonly recipesService: RecipesService) {}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Get()
	public async findAllRecipes(
		@Authorized('id') userId: string,
		@Body() dto: FindRecipesDto
	) {
		return this.recipesService.findAllRecipes(userId, dto)
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Get(':recipeId')
	public async findRecipeById(
		@Authorized('id') userId: string,
		@Param('recipeId') recipeId: string
	) {
		return this.recipesService.findRecipeById(userId, recipeId)
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Post('generate')
	public async generateRecipe(
		@Authorized('id') userId: string,
		@Body() dto: GenerateRecipeDto
	) {
		return this.recipesService.generateRecipe(userId, dto)
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Patch(':recipeId')
	public async updateRecipe(
		@Authorized('id') userId: string,
		@Param('recipeId') recipeId: string,
		@Body() dto: UpdateRecipeDto
	) {
		return this.recipesService.updateRecipe(userId, recipeId, dto)
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Delete(':recipeId')
	public async deleteRecipe(
		@Authorized('id') userId: string,
		@Param('recipeId') recipeId: string
	) {
		return this.recipesService.deleteRecipe(userId, recipeId)
	}
}
