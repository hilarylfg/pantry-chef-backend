import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { UserModule } from '../user/user.module.js'

import { AiController } from './ai.controller.js'
import { AiService } from './ai.service.js'
import { OpenRouterProvider } from './providers/openrouter.js'
import { VisionService } from './vision.service.js'

@Module({
	imports: [ConfigModule, UserModule],
	controllers: [AiController],
	providers: [OpenRouterProvider, AiService, VisionService],
	exports: [AiService, VisionService]
})
export class AiModule {}
