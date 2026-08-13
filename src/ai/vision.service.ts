import { Inject, Injectable } from '@nestjs/common'

import { ScanQrDto } from './dto/scan.dto'
import { OPENROUTER_CLIENT, OpenRouterClient } from './providers/openrouter'

@Injectable()
export class VisionService {
	constructor(
		@Inject(OPENROUTER_CLIENT)
		private readonly openrouter: OpenRouterClient
	) {}

	public async scanPhoto(imageBase64: string, mimeType: string) {
		// TODO: реализовать вызов vision-модели через generateObject
		// Сохранить результат во временное хранилище (scanId) для batch-confirm
		return {
			scanId: '',
			products: []
		}
	}

	public async parseQrCode(dto: ScanQrDto) {
		// TODO: парсинг GS1/DataMatrix (Честный ЗНАК)
		// dto.rawValue → данные о продукте
		return dto
	}
}
