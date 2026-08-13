import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { getProvidersConfig } from '../config/providers.config'
import { MailService } from '../libs/mail/mail.service'
import { UserModule } from '../user/user.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module'
import { ProviderModule } from './provider/provider.module'
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service'

@Module({
	imports: [
		UserModule,
		ProviderModule.registerAsync({
			imports: [ConfigModule],
			useFactory: getProvidersConfig,
			inject: [ConfigService]
		}),
		forwardRef(() => EmailConfirmationModule)
	],
	controllers: [AuthController],
	providers: [AuthService, MailService, TwoFactorAuthService],
	exports: [AuthService]
})
export class AuthModule {}
