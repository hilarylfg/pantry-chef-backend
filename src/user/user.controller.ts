import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch
} from '@nestjs/common'

import { Authorization } from '../auth/decorators/auth.decorator.js'
import { Authorized } from '../auth/decorators/authorized.decorator.js'
import { UserRole } from '../generated/prisma/client.js'

import { UpdateUserDto } from './dto/update-user.dto.js'
import { UserService } from './user.service.js'

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Get('me')
	public async findProfile(@Authorized('id') userId: string) {
		return this.userService.findById(userId)
	}

	@Authorization(UserRole.ADMIN)
	@HttpCode(HttpStatus.OK)
	@Get('by-id/:id')
	public async findById(@Param('id') id: string) {
		return this.userService.findById(id)
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Patch('me')
	public async updateProfile(
		@Authorized('id') userId: string,
		@Body() dto: UpdateUserDto
	) {
		return this.userService.update(userId, dto)
	}
}
