import { Injectable, InternalServerErrorException } from '@nestjs/common'
import type { Request } from 'express'

@Injectable()
export class SessionService {
	public async saveSession(req: Request, user: { id: string }) {
		return new Promise((resolve, reject) => {
			req.session.userId = user.id

			req.session.save(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Не удалось сохранить сессию. Проверьте, правильно ли настроены параметры сессии.'
						)
					)
				}

				resolve({
					user
				})
			})
		})
	}
}
