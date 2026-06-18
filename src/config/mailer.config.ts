import { MailerOptions } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

export const getMailerConfig = (
	configService: ConfigService
): MailerOptions => {
	const port = configService.get<number>('MAIL_PORT')

	return {
		transport: {
			host: configService.getOrThrow<string>('MAIL_HOST'),
			port: port,
			secure: false,
			requireTLS: true,
			auth: {
				user: configService.getOrThrow<string>('MAIL_LOGIN'),
				pass: configService.getOrThrow<string>('MAIL_PASSWORD')
			},
			connectionTimeout: 10000
		},
		defaults: {
			from: `"Bot4You Team" <${configService.getOrThrow<string>('MAIL_FROM')}>`
		}
	}
}
