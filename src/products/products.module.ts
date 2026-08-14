import { Module } from '@nestjs/common'

import { AiModule } from '../ai/ai.module.js'
import { UserModule } from '../user/user.module.js'

import { ProductsController } from './products.controller.js'
import { ProductsService } from './products.service.js'

@Module({
	controllers: [ProductsController],
	providers: [ProductsService],
	imports: [UserModule, AiModule]
})
export class ProductsModule {}
