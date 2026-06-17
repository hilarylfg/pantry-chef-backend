import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { getProvidersConfig } from '../config/providers.config'
import { MailService } from '../libs/mail/mail.service'
import { UserService } from '../user/user.service'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module'
import { ProviderModule } from './provider/provider.module'
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service'

@Module({
	imports: [
		ProviderModule.registerAsync({
			imports: [ConfigModule],
			useFactory: getProvidersConfig,
			inject: [ConfigService]
		}),
		forwardRef(() => EmailConfirmationModule)
	],
	controllers: [AuthController],
	providers: [AuthService, UserService, MailService, TwoFactorAuthService],
	exports: [AuthService]
})
export class AuthModule {}
