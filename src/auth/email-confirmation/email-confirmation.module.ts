import { Module } from '@nestjs/common'

import { MailModule } from '../../libs/mail/mail.module.js'
import { MailService } from '../../libs/mail/mail.service.js'
import { UserService } from '../../user/user.service.js'
import { SessionService } from '../session.service.js'

import { EmailConfirmationController } from './email-confirmation.controller.js'
import { EmailConfirmationService } from './email-confirmation.service.js'

@Module({
	imports: [MailModule],
	controllers: [EmailConfirmationController],
	providers: [
		EmailConfirmationService,
		SessionService,
		UserService,
		MailService
	],
	exports: [EmailConfirmationService]
})
export class EmailConfirmationModule {}
