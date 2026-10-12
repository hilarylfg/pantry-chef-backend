import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ScanQrDto } from './dto/scan.dto.js'
import { AI_CLIENT, AiClient } from './providers/ai-client.js'

@Injectable()
export class VisionService {
	constructor(
		@Inject(AI_CLIENT)
		private readonly aiClient: AiClient,
		private readonly configService: ConfigService
	) {}

	public scanPhoto(_imageBase64: string, _mimeType: string) {
		// TODO: реализовать вызов vision-модели через generateObject
		// this.aiClient(configService.get('AI_VISION_MODEL') ?? DEFAULT_VISION_MODEL)
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
