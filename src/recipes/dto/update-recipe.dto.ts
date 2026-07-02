import { IsBoolean, IsOptional } from 'class-validator'

export class UpdateRecipeDto {
	@IsOptional()
	@IsBoolean({ message: 'isFavorite должно быть boolean.' })
	isFavorite?: boolean
}
