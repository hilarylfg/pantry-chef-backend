import { Module } from '@nestjs/common'

import { AiModule } from '@/ai/ai.module'
import { UserModule } from '@/user/user.module'

import { RecipesController } from './recipes.controller'
import { RecipesService } from './recipes.service'

@Module({
	imports: [AiModule, UserModule],
	controllers: [RecipesController],
	providers: [RecipesService]
})
export class RecipesModule {}
