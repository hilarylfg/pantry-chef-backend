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

	@IsOptional()
	@IsNumber()
	maxTokens?: number
}
