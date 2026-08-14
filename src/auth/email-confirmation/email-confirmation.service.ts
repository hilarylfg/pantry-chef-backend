import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Request } from 'express'
import { randomUUID } from 'node:crypto'

import { TokenType } from '../../generated/prisma/client.js'
import { MailService } from '../../libs/mail/mail.service.js'
import { PrismaService } from '../../prisma/prisma.service.js'
import { UserService } from '../../user/user.service.js'
import { SessionService } from '../session.service.js'

import { ConfirmationDto } from './dto/confirmation.dto.js'

@Injectable()
export class EmailConfirmationService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService,
		private readonly userService: UserService,
		private readonly sessionService: SessionService
	) {}

	public async newVerification(req: Request, dto: ConfirmationDto) {
		const existingToken = await this.prismaService.token.findUnique({
			where: {
				token: dto.token,
				type: TokenType.VERIFICATION
			}
		})

		if (!existingToken) {
			throw new NotFoundException(
				'Токен подтверждения не найден. Пожалуйста, убедитесь, что у вас правильный токен.'
			)
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date()

		if (hasExpired) {
			throw new BadRequestException(
				'Токен подтверждения истек. Пожалуйста, запросите новый токен для подтверждения.'
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
				isVerified: true
			}
		})

		await this.prismaService.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.VERIFICATION
			}
		})

		return this.sessionService.saveSession(req, existingUser)
	}

	public async sendVerificationToken(email: string) {
		const verificationToken = await this.generateVerificationToken(email)

		// Checking for resend.com
		await this.mailService.sendTestEmail(email)

		await this.mailService.sendConfirmationEmail(
			verificationToken.email,
			verificationToken.token
		)

		return true
	}

	private async generateVerificationToken(email: string) {
		const token = randomUUID()
		const expiresIn = new Date(new Date().getTime() + 3600 * 1000)

		const existingToken = await this.prismaService.token.findFirst({
			where: {
				email,
				type: TokenType.VERIFICATION
			}
		})

		if (existingToken) {
			await this.prismaService.token.delete({
				where: {
					id: existingToken.id,
					type: TokenType.VERIFICATION
				}
			})
		}

		return this.prismaService.token.create({
			data: {
				email,
				token,
				expiresIn,
				type: TokenType.VERIFICATION
			}
		})
	}
}
