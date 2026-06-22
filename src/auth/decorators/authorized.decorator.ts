import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

import { User } from '@/generated/prisma/client'

export const Authorized = createParamDecorator(
	(data: keyof User, ctx: ExecutionContext) => {
		const request = ctx
			.switchToHttp()
			.getRequest<Request & { user: User }>()
		const user = request.user

		return data ? user[data] : user
	}
)
