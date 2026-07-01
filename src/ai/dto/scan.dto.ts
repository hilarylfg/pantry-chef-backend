import { Type } from 'class-transformer'
import {
	IsArray,
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
	Min,
	ValidateNested
} from 'class-validator'

export class ScanQrDto {
	@IsString({ message: 'rawValue должен быть строкой.' })
	@IsNotEmpty({ message: 'rawValue обязателен.' })
	rawValue!: string
}

export class ProductCorrectionDto {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsNumber()
	@Min(0)
	amount?: number

	@IsOptional()
	@IsString()
	unit?: string

	@IsOptional()
	@IsString()
	category?: string
}

export class BatchConfirmItemDto {
	@IsNumber({}, { message: 'recognizedIndex должен быть числом.' })
	recognizedIndex!: number

	@IsBoolean({ message: 'confirmed должен быть boolean.' })
	confirmed!: boolean

	@IsOptional()
	@IsObject()
	corrections?: ProductCorrectionDto | null
}

export class BatchConfirmDto {
	@IsString({ message: 'scanId должен быть строкой.' })
	@IsNotEmpty({ message: 'scanId обязателен.' })
	scanId!: string

	@IsArray({ message: 'products должен быть массивом.' })
	@ValidateNested({ each: true })
	@Type(() => BatchConfirmItemDto)
	products!: BatchConfirmItemDto[]
}
