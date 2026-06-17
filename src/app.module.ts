import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AiModule } from './ai/ai.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { IS_DEV_ENV } from './libs/common/utils/is-dev.util'
import { PrismaModule } from './prisma/prisma.module'
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { RecipesModule } from './recipes/recipes.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		PrismaModule,
		AiModule,
		UserModule,
		AuthModule,
		ProductsModule,
		RecipesModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
