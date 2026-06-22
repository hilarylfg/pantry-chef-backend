import { IsNumber, IsOptional, IsString } from 'class-validator'

export class StreamDto {
	@IsString()
	prompt!: string

	@IsOptional()
	@IsString()
	model?: string

	@IsOptional()
	@IsNumber()
	temperature?: number
}

export class GenerateRecipeDto extends StreamDto {
	@IsOptional()
	cuisine?: string
	@IsOptional()
	difficulty?: string
}
