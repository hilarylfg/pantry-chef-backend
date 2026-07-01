import { IsNumber, IsOptional, IsString } from 'class-validator'

export class StreamDto {
	@IsString({ message: 'prompt должен быть строкой.' })
	prompt!: string

	@IsOptional()
	@IsString({ message: 'model должен быть строкой.' })
	model?: string

	@IsOptional()
	@IsNumber({}, { message: 'temperature должен быть числом.' })
	temperature?: number
}

export class GenerateRecipeDto extends StreamDto {
	@IsOptional()
	@IsString({ message: 'cuisine должен быть строкой.' })
	cuisine?: string

	@IsOptional()
	@IsString({ message: 'difficulty должен быть строкой.' })
	difficulty?: string
}
