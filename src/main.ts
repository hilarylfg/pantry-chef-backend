import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { RedisStore } from 'connect-redis'
import { Express } from 'express'
import { createClient } from 'redis'

import { AppModule } from './app.module'
import { ms, StringValue } from './libs/common/utils/ms.util'
import { parseBoolean } from './libs/common/utils/parse-boolean.util'

// eslint-disable-next-line @typescript-eslint/no-require-imports
import cookieParser = require('cookie-parser')
// eslint-disable-next-line @typescript-eslint/no-require-imports
import session = require('express-session')

async function bootstrap() {
	const logger = new Logger('Bootstrap')
	const app = await NestFactory.create(AppModule)
	const config = app.get(ConfigService)
	const redis = createClient({
		url: config.getOrThrow('REDIS_URI'),
		password: config.getOrThrow<string>('REDIS_PASSWORD')
	})
	redis.on('error', err => {
		logger.error('Redis connection error:', err)
	})
	await redis.connect()

	app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

	const expressApp = app.getHttpAdapter().getInstance() as Express
	expressApp.set('trust proxy', 1)

	app.enableCors({
		origin: config.getOrThrow<string>('ALLOWED_ORIGINS'),
		credentials: true,
		exposedHeaders: ['set-cookie'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
	})

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true
		})
	)

	const rawSameSite = config.get<string>('SESSION_SAME_SITE') ?? 'lax'
	const sameSite = (
		['lax', 'none', 'strict'].includes(rawSameSite.toLowerCase())
			? rawSameSite.toLowerCase()
			: 'lax'
	) as 'lax' | 'none' | 'strict'
	const sessionDomain = config.get<string>('SESSION_DOMAIN') || undefined
	const sessionSecure =
		sameSite === 'none'
			? true
			: parseBoolean(config.getOrThrow<string>('SESSION_SECURE'))

	app.use(
		session({
			secret: config.getOrThrow<string>('SESSION_SECRET'),
			name: config.getOrThrow<string>('SESSION_NAME'),
			resave: true,
			saveUninitialized: false,
			cookie: {
				domain: sessionDomain,
				maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
				httpOnly: parseBoolean(
					config.getOrThrow<string>('SESSION_HTTP_ONLY')
				),
				secure: sessionSecure,
				sameSite
			},
			store: new RedisStore({
				client: redis,
				prefix: config.getOrThrow<string>('SESSION_FOLDER')
			})
		})
	)

	await app.listen(process.env.APPLICATION_PORT ?? 3000)
}
bootstrap()
