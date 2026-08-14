import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { getProvidersConfig } from '../config/providers.config.js'
import { MailService } from '../libs/mail/mail.service.js'
import { UserModule } from '../user/user.module.js'

import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module.js'
import { ProviderModule } from './provider/provider.module.js'
import { SessionService } from './session.service.js'
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service.js'

@Module({
	imports: [
		UserModule,
		ProviderModule.registerAsync({
			imports: [ConfigModule],
			useFactory: getProvidersConfig,
			inject: [ConfigService]
		}),
		EmailConfirmationModule
	],
	controllers: [AuthController],
	providers: [AuthService, MailService, SessionService, TwoFactorAuthService],
	exports: [AuthService]
})
export class AuthModule {}
