import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

export class FindRecommendationsDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Количество должно быть целым числом.' })
	@Min(1, { message: 'Количество должно быть не меньше 1.' })
	@Max(10, { message: 'Количество не может превышать 10.' })
	count: number = 3
}
