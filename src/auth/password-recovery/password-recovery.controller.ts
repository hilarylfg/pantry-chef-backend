import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Param,
	Post
} from '@nestjs/common'

import { NewPasswordDto } from './dto/new-password.dto.js'
import { ResetPasswordDto } from './dto/reset-password.dto.js'
import { PasswordRecoveryService } from './password-recovery.service.js'

@Controller('auth/password-recovery')
export class PasswordRecoveryController {
	constructor(
		private readonly passwordRecoveryService: PasswordRecoveryService
	) {}

	@Post('reset')
	@HttpCode(HttpStatus.OK)
	public async resetPassword(@Body() dto: ResetPasswordDto) {
		return this.passwordRecoveryService.resetPassword(dto)
	}

	@Post('new/:token')
	@HttpCode(HttpStatus.OK)
	public async newPassword(
		@Body() dto: NewPasswordDto,
		@Param('token') token: string
	) {
		return this.passwordRecoveryService.newPassword(dto, token)
	}
}
