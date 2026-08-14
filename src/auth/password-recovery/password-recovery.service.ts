import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { hash } from 'argon2'
import { randomUUID } from 'node:crypto'

import { TokenType } from '../../generated/prisma/enums.js'
import { MailService } from '../../libs/mail/mail.service.js'
import { PrismaService } from '../../prisma/prisma.service.js'
import { UserService } from '../../user/user.service.js'

import { NewPasswordDto } from './dto/new-password.dto.js'
import { ResetPasswordDto } from './dto/reset-password.dto.js'

@Injectable()
export class PasswordRecoveryService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly userService: UserService,
		private readonly mailService: MailService
	) {}

	public async resetPassword(dto: ResetPasswordDto) {
		const existingUser = await this.userService.findByEmail(dto.email)

		if (!existingUser) {
			throw new NotFoundException(
				'Пользователь не найден. Пожалуйста, проверьте введенный адрес электронной почты и попробуйте снова.'
			)
		}

		const passwordResetToken = await this.generatePasswordResetToken(
			existingUser.email
		)

		// Checking for resend.com
		await this.mailService.sendTestEmail(existingUser.email)

		await this.mailService.sendPasswordResetEmail(
			passwordResetToken.email,
			passwordResetToken.token
		)

		return true
	}

	public async newPassword(dto: NewPasswordDto, token: string) {
		const existingToken = await this.prismaService.token.findFirst({
			where: {
				token,
				type: TokenType.PASSWORD_RESET
			}
		})

		if (!existingToken) {
			throw new NotFoundException(
				'Токен не найден. Пожалуйста, проверьте правильность введенного токена или запросите новый.'
			)
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date()

		if (hasExpired) {
			throw new BadRequestException(
				'Токен истек. Пожалуйста, запросите новый токен для подтверждения сброса пароля.'
			)
		}

		const existingUser = await this.userService.findByEmail(
			existingToken.email
		)

		if (!existingUser) {
			throw new NotFoundException(
				'Пользователь не найден. Пожалуйста, проверьте введенный адрес электронной почты и попробуйте снова.'
			)
		}

		await this.prismaService.user.update({
			where: {
				id: existingUser.id
			},
			data: {
				password: await hash(dto.password)
			}
		})

		await this.prismaService.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.PASSWORD_RESET
			}
		})

		return true
	}

	private async generatePasswordResetToken(email: string) {
		const token = randomUUID()
		const expiresIn = new Date(new Date().getTime() + 3600 * 1000)

		const existingToken = await this.prismaService.token.findFirst({
			where: {
				email,
				type: TokenType.PASSWORD_RESET
			}
		})

		if (existingToken) {
			await this.prismaService.token.delete({
				where: {
					id: existingToken.id,
					type: TokenType.PASSWORD_RESET
				}
			})
		}

		return this.prismaService.token.create({
			data: {
				email,
				token,
				expiresIn,
				type: TokenType.PASSWORD_RESET
			}
		})
	}
}
