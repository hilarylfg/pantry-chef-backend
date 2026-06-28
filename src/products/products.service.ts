import { Injectable } from '@nestjs/common'

import { Product } from '@/generated/prisma/client'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class ProductsService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findProducts(
		userId: string,
		category = 'dairy',
		sort = 'expiryDate',
		order = 'asc',
		page = 1,
		limit = 20
	): Promise<Product[]> {
		const sortOrder = order === 'desc' ? 'desc' : 'asc'
		const safePage =
			Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
		const safeLimit =
			Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20
		const skip = (safePage - 1) * safeLimit

		return this.prismaService.product.findMany({
			where: {
				userId,
				category
			},
			orderBy:
				sort === 'createdAt'
					? { createdAt: sortOrder }
					: sort === 'name'
						? { name: sortOrder }
						: sort === 'amount'
							? { amount: sortOrder }
							: sort === 'unit'
								? { unit: sortOrder }
								: sort === 'category'
									? { category: sortOrder }
									: { expiryDate: sortOrder },
			skip,
			take: safeLimit
		})
	}
}
