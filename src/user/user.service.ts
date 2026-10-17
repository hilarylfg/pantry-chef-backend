import { Injectable, NotFoundException } from '@nestjs/common'
import { hash } from 'argon2'

import { AuthMethod, Prisma } from '../generated/prisma/client.js'
import { PrismaService } from '../prisma/prisma.service.js'

import { UpdateUserDto } from './dto/update-user.dto.js'

const accountsSelect = {
	id: true,
	type: true,
	provider: true,
	providerAccountId: true,
	createdAt: true,
	updatedAt: true
} satisfies Prisma.AccountSelect

const publicUserSelect = {
	id: true,
	email: true,
	displayName: true,
	picture: true,
	role: true,
	isVerified: true,
	isTwoFactorEnabled: true,
	method: true,
	createdAt: true,
	updatedAt: true,
	accounts: { select: accountsSelect }
} satisfies Prisma.UserSelect

const authUserSelect = {
	...publicUserSelect,
	password: true
} satisfies Prisma.UserSelect

export type PublicUser = Prisma.UserGetPayload<{
	select: typeof publicUserSelect
}>

export type AuthUser = Prisma.UserGetPayload<{
	select: typeof authUserSelect
}>

@Injectable()
export class UserService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findById(id: string): Promise<PublicUser> {
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			},
			select: publicUserSelect
		})

		if (!user) {
			throw new NotFoundException(
				'Пользователь не найден. Пожалуйста, проверьте введенные данные.'
			)
		}

		return user
	}

	public async findByEmail(email: string): Promise<AuthUser | null> {
		return this.prismaService.user.findUnique({
			where: {
				email
			},
			select: authUserSelect
		})
	}

	public async create(
		email: string,
		password: string,
		displayName: string,
		picture: string,
		method: AuthMethod,
		isVerified: boolean
	): Promise<PublicUser> {
		return this.prismaService.user.create({
			data: {
				email,
				password: password ? await hash(password) : '',
				displayName,
				picture,
				method,
				isVerified
			},
			select: publicUserSelect
		})
	}

	public async createWithTransaction(
		tx: Prisma.TransactionClient,
		email: string,
		password: string,
		displayName: string,
		picture: string,
		method: AuthMethod,
		isVerified: boolean
	): Promise<PublicUser> {
		return tx.user.create({
			data: {
				email,
				password: password ? await hash(password) : '',
				displayName,
				picture,
				method,
				isVerified
			},
			select: publicUserSelect
		})
	}

	public async update(
		userId: string,
		dto: UpdateUserDto
	): Promise<PublicUser> {
		const user = await this.findById(userId)

		return this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				email: dto.email,
				displayName: dto.name,
				isTwoFactorEnabled: dto.isTwoFactorEnabled
			},
			select: publicUserSelect
		})
	}
}
