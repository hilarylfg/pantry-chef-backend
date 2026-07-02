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
