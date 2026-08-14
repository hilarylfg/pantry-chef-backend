import { ConfigService } from '@nestjs/config'

import { TypeOptions } from '../auth/provider/provider.constants.js'
import { GithubProvider } from '../auth/provider/services/github.provider.js'
import { GoogleProvider } from '../auth/provider/services/google.provider.js'
import { YandexProvider } from '../auth/provider/services/yandex.provider.js'

export const getProvidersConfig = (
	configService: ConfigService
): TypeOptions => ({
	baseUrl: configService.getOrThrow<string>('APPLICATION_URL'),
	services: [
		new GoogleProvider({
			client_id: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
			client_secret: configService.getOrThrow<string>(
				'GOOGLE_CLIENT_SECRET'
			),
			scopes: ['email', 'profile']
		}),
		new YandexProvider({
			client_id: configService.getOrThrow<string>('YANDEX_CLIENT_ID'),
			client_secret: configService.getOrThrow<string>(
				'YANDEX_CLIENT_SECRET'
			),
			scopes: ['login:email', 'login:avatar', 'login:info']
		}),
		new GithubProvider({
			client_id: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
			client_secret: configService.getOrThrow<string>(
				'GITHUB_CLIENT_SECRET'
			),
			scopes: ['read:user', 'user:email']
		})
	]
})
