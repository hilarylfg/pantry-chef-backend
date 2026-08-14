import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AiModule } from './ai/ai.module.js'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { AuthModule } from './auth/auth.module.js'
import { EmailConfirmationModule } from './auth/email-confirmation/email-confirmation.module.js'
import { PasswordRecoveryModule } from './auth/password-recovery/password-recovery.module.js'
import { ProviderModule } from './auth/provider/provider.module.js'
import { TwoFactorAuthModule } from './auth/two-factor-auth/two-factor-auth.module.js'
import { IS_DEV_ENV } from './libs/common/utils/is-dev.util.js'
import { MailModule } from './libs/mail/mail.module.js'
import { PrismaModule } from './prisma/prisma.module.js'
import { ProductsModule } from './products/products.module.js'
import { RecipesModule } from './recipes/recipes.module.js'
import { UserModule } from './user/user.module.js'

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
		RecipesModule,
		ProviderModule,
		MailModule,
		EmailConfirmationModule,
		PasswordRecoveryModule,
		TwoFactorAuthModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
