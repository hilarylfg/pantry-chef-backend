import { Body, Controller, Post, Res } from '@nestjs/common'
import type { Response } from 'express'

import { AiService } from './ai.service'
import { StreamDto } from './dto/ai.dto'

@Controller('ai')
export class AiController {
	constructor(private readonly aiService: AiService) {}

	@Post('stream')
	stream(@Body() dto: StreamDto, @Res() res: Response) {
		this.aiService.streamChat(dto).pipeTextStreamToResponse(res)
	}
}
