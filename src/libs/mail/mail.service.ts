import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'

import { ConfirmationTemplate } from './templates/confirmation.template'
import { ResetPasswordTemplate } from './templates/reset-password.template'
import { TwoFactorAuthTemplate } from './templates/two-factor-auth.template'

@Injectable()
export class MailService {
	public constructor(
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService
	) {}

	public async sendConfirmationEmail(
		email: string,
		token: string
	): Promise<void> {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGINS')
		const html = await render(ConfirmationTemplate({ domain, token }))

		await this.sendMail(email, 'Подтверждение почты', html)
	}

	public async sendPasswordResetEmail(
		email: string,
		token: string
	): Promise<void> {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGINS')
		const html = await render(ResetPasswordTemplate({ domain, token }))

		await this.sendMail(email, 'Сброс пароля', html)
	}

	public async sendTwoFactorTokenEmail(
		email: string,
		token: string
	): Promise<void> {
		const html = await render(TwoFactorAuthTemplate({ token }))

		await this.sendMail(email, 'Подтверждение вашей личности', html)
	}

	private sendMail(email: string, subject: string, html: string) {
		return this.mailerService.sendMail({
			to: email,
			subject,
			html
		})
	}

	// Checking for resend.com
	public async sendTestEmail(email: string) {
		const apiKey = this.configService.getOrThrow<string>('MAIL_PASSWORD')

		const checkContact = async () => {
			try {
				return await fetch(`https://api.resend.com/contacts/${email}`, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${apiKey}`
					}
				})
			} catch (err) {
				console.warn(
					'Failed to check contact on Resend (network):',
					err
				)
				return null
			}
		}

		try {
			let checkResp = await checkContact()

			if (checkResp === null) return false

			if (checkResp.status === 404) {
				try {
					const createResp = await fetch(
						'https://api.resend.com/contacts',
						{
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								email,
								unsubscribed: true
							})
						}
					)

					if (!createResp.ok) {
						console.warn(
							'Failed to create contact on Resend:',
							createResp.status
						)
						return false
					}

					const maxAttempts = 6
					const delayMs = 500
					for (let i = 0; i < maxAttempts; i++) {
						await new Promise(r => setTimeout(r, delayMs))
						checkResp = await checkContact()
						if (checkResp && checkResp.ok) {
							return true
						}
					}

					console.warn(
						'Contact created but not available after polling'
					)
					return false
				} catch (err) {
					console.warn('Failed to create contact on Resend:', err)
					return false
				}
			} else if (!checkResp.ok) {
				console.warn(
					'Unexpected response when checking contact on Resend:',
					checkResp.status
				)
				return false
			}

			return true
		} catch (err) {
			console.warn('Failed to check/create contact on Resend:', err)
			return false
		}
	}
}
