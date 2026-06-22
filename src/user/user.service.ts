import { Injectable, NotFoundException } from '@nestjs/common'
import { hash } from 'argon2'

import { AuthMethod, PrismaClient, User } from '@/generated/prisma/client'
import { PrismaService } from '@/prisma/prisma.service'

import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findById(id: string): Promise<User> {
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			},
			include: {
				accounts: true
			}
		})

		if (!user) {
			throw new NotFoundException(
				'Пользователь не найден. Пожалуйста, проверьте введенные данные.'
			)
		}

		return user
	}

	public async findByEmail(email: string): Promise<User | null> {
		return this.prismaService.user.findUnique({
			where: {
				email
			},
			include: {
				accounts: true
			}
		})
	}

	public async create(
		email: string,
		password: string,
		displayName: string,
		picture: string,
		method: AuthMethod,
		isVerified: boolean
	): Promise<User> {
		return this.prismaService.user.create({
			data: {
				email,
				password: password ? await hash(password) : '',
				displayName,
				picture,
				method,
				isVerified
			},
			include: {
				accounts: true
			}
		})
	}

	public async createWithTransaction(
		tx: PrismaClient,
		email: string,
		password: string,
		displayName: string,
		picture: string,
		method: AuthMethod,
		isVerified: boolean
	): Promise<User> {
		return tx.user.create({
			data: {
				email,
				password: password ? await hash(password) : '',
				displayName,
				picture,
				method,
				isVerified
			},
			include: {
				accounts: true
			}
		})
	}

	public async update(userId: string, dto: UpdateUserDto): Promise<User> {
		const user = await this.findById(userId)

		return this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				email: dto.email,
				displayName: dto.name,
				isTwoFactorEnabled: dto.isTwoFactorEnabled
			}
		})
	}
}
