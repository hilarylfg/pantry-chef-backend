import { Body, Controller, Post, Res } from '@nestjs/common'
import type { Response } from 'express'

import { Authorization } from '../auth/decorators/auth.decorator'
import { Authorized } from '../auth/decorators/authorized.decorator'

import { AiService } from './ai.service'
import { StreamDto } from './dto/chat.dto'
import { ScanQrDto } from './dto/scan.dto'
import { VisionService } from './vision.service'

@Controller('ai')
export class AiController {
	constructor(
		private readonly aiService: AiService,
		private readonly visionService: VisionService
	) {}

	@Authorization()
	@Post('stream')
	stream(@Body() dto: StreamDto, @Res() res: Response) {
		this.aiService.streamChat(dto).pipeTextStreamToResponse(res)
	}

	@Authorization()
	@Post('scan-qr')
	scanQr(@Authorized('id') _userId: string, @Body() dto: ScanQrDto) {
		return this.visionService.parseQrCode(dto)
	}
}
