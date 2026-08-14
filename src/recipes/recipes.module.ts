import { Module } from '@nestjs/common'

import { AiModule } from '../ai/ai.module.js'
import { UserModule } from '../user/user.module.js'

import { RecipesController } from './recipes.controller.js'
import { RecipesService } from './recipes.service.js'

@Module({
	imports: [AiModule, UserModule],
	controllers: [RecipesController],
	providers: [RecipesService]
})
export class RecipesModule {}
