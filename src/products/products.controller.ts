import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common'

import { Authorization } from '@/auth/decorators/auth.decorator'
import { Authorized } from '@/auth/decorators/authorized.decorator'

import { ProductsService } from './products.service'

@Controller('products')
export class ProductsController {
	public constructor(private readonly productsService: ProductsService) {}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Get()
	public async findProducts(
		@Authorized('id') userId: string,
		@Query('category') category = 'dairy',
		@Query('sort') sort = 'expiryDate',
		@Query('order') order = 'asc',
		@Query('page') page = '1',
		@Query('limit') limit = '20'
	) {
		return this.productsService.findProducts(
			userId,
			category,
			sort,
			order,
			Number(page),
			Number(limit)
		)
	}
}
