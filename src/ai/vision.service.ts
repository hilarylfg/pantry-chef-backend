import { Inject, Injectable } from '@nestjs/common'

import { ScanQrDto } from './dto/scan.dto.js'
import { OPENROUTER_CLIENT, OpenRouterClient } from './providers/openrouter.js'

@Injectable()
export class VisionService {
	constructor(
		@Inject(OPENROUTER_CLIENT)
		private readonly openrouter: OpenRouterClient
	) {}

	public scanPhoto(_imageBase64: string, _mimeType: string) {
		// TODO: реализовать вызов vision-модели через generateObject
		// Сохранить результат во временное хранилище (scanId) для batch-confirm
		return {
			scanId: '',
			products: []
		}
	}

	public parseQrCode(dto: ScanQrDto) {
		// TODO: парсинг GS1/DataMatrix (Честный ЗНАК)
		// dto.rawValue → данные о продукте
		return dto
	}
}
