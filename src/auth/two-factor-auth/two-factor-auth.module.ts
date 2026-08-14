import { Module } from '@nestjs/common'

import { MailService } from '../../libs/mail/mail.service.js'

import { TwoFactorAuthService } from './two-factor-auth.service.js'

@Module({
	providers: [TwoFactorAuthService, MailService]
})
export class TwoFactorAuthModule {}
