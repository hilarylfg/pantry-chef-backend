import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { PublicUser } from '../../user/user.service.js'

export const Authorized = createParamDecorator(
	(data: keyof PublicUser, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<{ user: PublicUser }>()
		const user = request.user

		return data ? user[data] : user
	}
)
