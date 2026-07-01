import { Injectable } from '@nestjs/common'

import { Product } from '@/generated/prisma/client'
import { ProductSortField, SortOrder } from '@/libs/common/types/product'
import { PrismaService } from '@/prisma/prisma.service'

import { FindProductsDto } from './dto/find-products.dto'
import { ConsumeProductDto, ProductDto } from './dto/product.dto'

@Injectable()
export class ProductsService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findAllProducts(
		userId: string,
		dto: FindProductsDto
	): Promise<Product[]> {
		const skip = (dto.page - 1) * dto.limit

		return this.prismaService.product.findMany({
			where: {
				userId,
				category: dto.category
			},
			orderBy: this.buildOrderBy(dto.sort, dto.order),
			skip,
			take: dto.limit
		})
	}

	public async createProduct(
		userId: string,
		dto: ProductDto
	): Promise<Product> {
		return this.prismaService.product.create({
			data: {
				name: dto.name,
				category: dto.category,
				amount: dto.amount,
				unit: dto.unit,
				expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
				userId
			}
		})
	}

	public async findProductById(
		userId: string,
		productId: string
	): Promise<Product> {
		return this.prismaService.product.findFirst({
			where: {
				id: productId,
				userId
			}
		})
	}

	public async updateProduct(
		userId: string,
		productId: string,
		dto: ProductDto
	): Promise<Product> {
		const data: Record<string, unknown> = {}

		if (dto.name !== undefined) data.name = dto.name
		if (dto.category !== undefined) data.category = dto.category
		if (dto.amount !== undefined) data.amount = dto.amount
		if (dto.unit !== undefined) data.unit = dto.unit
		if (dto.expiryDate !== undefined) {
			data.expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null
		}

		return this.prismaService.product.update({
			where: { id: productId, userId },
			data
		})
	}

	public async deleteProduct(
		userId: string,
		productId: string
	): Promise<Product> {
		return this.prismaService.product.delete({
			where: {
				id: productId,
				userId
			}
		})
	}

	public async expiringSoonProducts(
		userId: string,
		days: string
	): Promise<Product[]> {
		return this.prismaService.product.findMany({
			where: {
				userId,
				expiryDate: {
					gte: new Date(),
					lte: new Date(Date.now() + Number(days) * 86400000)
				}
			}
		})
	}

	public async consumeProduct(
		userId: string,
		productId: string,
		dto: ConsumeProductDto
	): Promise<Product> {
		const product = await this.prismaService.product.findFirst({
			where: { id: productId, userId }
		})

		const newAmount = product.amount - dto.amount

		if (newAmount <= 0) {
			return this.prismaService.product.delete({
				where: { id: productId }
			})
		}

		return this.prismaService.product.update({
			where: { id: productId },
			data: { amount: newAmount }
		})
	}

	private buildOrderBy(sort: ProductSortField, order: SortOrder) {
		switch (sort) {
			case 'createdAt':
				return { createdAt: order }
			case 'name':
				return { name: order }
			case 'amount':
				return { amount: order }
			case 'unit':
				return { unit: order }
			case 'category':
				return { category: order }
			default:
				return { expiryDate: order }
		}
	}
}
