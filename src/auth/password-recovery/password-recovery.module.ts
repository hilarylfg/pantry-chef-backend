import { Module } from '@nestjs/common'

import { MailService } from '../../libs/mail/mail.service.js'
import { UserService } from '../../user/user.service.js'

import { PasswordRecoveryController } from './password-recovery.controller.js'
import { PasswordRecoveryService } from './password-recovery.service.js'

@Module({
	controllers: [PasswordRecoveryController],
	providers: [PasswordRecoveryService, UserService, MailService]
})
export class PasswordRecoveryModule {}
