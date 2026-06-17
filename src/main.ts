import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const config = app.get(ConfigService)

	app.enableCors({
		origin: config.getOrThrow<string>('ALLOWED_ORIGINS'),
		credentials: true,
		exposedHeaders: ['set-cookie'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
	})

	await app.listen(process.env.APPLICATION_PORT ?? 3000)
}
bootstrap()
