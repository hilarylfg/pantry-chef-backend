import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { UserModule } from '../user/user.module'

import { AiController } from './ai.controller'
import { AiService } from './ai.service'
import { OpenRouterProvider } from './providers/openrouter'
import { VisionService } from './vision.service'

@Module({
	imports: [ConfigModule, UserModule],
	controllers: [AiController],
	providers: [OpenRouterProvider, AiService, VisionService],
	exports: [AiService, VisionService]
})
export class AiModule {}
