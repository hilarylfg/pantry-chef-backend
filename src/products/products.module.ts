import { Module } from '@nestjs/common'

import { AiModule } from '@/ai/ai.module'
import { UserModule } from '@/user/user.module'

import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
	controllers: [ProductsController],
	providers: [ProductsService],
	imports: [UserModule, AiModule]
})
export class ProductsModule {}
