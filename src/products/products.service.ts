import { Injectable, Logger, NotFoundException } from '@nestjs/common'

import { AiService } from '../ai/ai.service'
import { gtinEnrichment } from '../ai/prompts/gtin-enrichment'
import { GtinProductSchema } from '../ai/types/ai.schema'
import { Product } from '../generated/prisma/client'
import { ProductSortField, SortOrder } from '../libs/common/types/product'
import { PrismaService } from '../prisma/prisma.service'

import { FindProductsDto } from './dto/find-products.dto'
import { ConsumeProductDto, ProductDto } from './dto/product.dto'
import { OffResponse } from './types/off-product.types'

@Injectable()
export class ProductsService {
	private readonly logger = new Logger(ProductsService.name)

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly aiService: AiService
	) {}

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

	public async scanBarcode(
		userId: string,
		barcode: string
	): Promise<Product> {
		const response = await fetch(
			`https://world.openfoodfacts.net/api/v2/product/${barcode}`
		)

		if (!response.ok) {
			throw new NotFoundException('Штрихкод не найден')
		}

		const offData = (await response.json()) as OffResponse

		if (offData.status === 0 || !offData.product) {
			throw new NotFoundException('Продукт с таким штрихкодом не найден')
		}

		const offProduct = offData.product

		const hasName =
			offProduct.product_name_ru ||
			offProduct.product_name ||
			offProduct.generic_name

		if (!hasName) {
			throw new NotFoundException(
				'Продукт найден, но данные о нём отсутствуют в базе. Добавьте вручную.'
			)
		}

		let product

		try {
			product = await this.aiService.generateStructured(
				JSON.stringify(offProduct),
				GtinProductSchema,
				{
					systemPrompt: gtinEnrichment,
					temperature: 0
				}
			)
		} catch (err) {
			this.logger.error('AI barcode recognition failed:', err)
			throw new NotFoundException(
				'Не удалось распознать продукт по штрихкоду. Добавьте вручную.'
			)
		}

		return this.prismaService.product.create({
			data: {
				name: product.name,
				category: product.category,
				amount: product.amount,
				unit: product.unit,
				userId
			}
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
