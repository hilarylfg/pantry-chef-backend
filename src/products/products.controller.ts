import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query
} from '@nestjs/common'

import { Authorization } from '@/auth/decorators/auth.decorator'
import { Authorized } from '@/auth/decorators/authorized.decorator'
import { FindProductsDto } from '@/products/dto/find-products.dto'
import { ConsumeProductDto, ProductDto } from '@/products/dto/product.dto'

import { ProductsService } from './products.service'

@Controller('products')
export class ProductsController {
	public constructor(private readonly productsService: ProductsService) {}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Get()
	public async findAllProducts(
		@Authorized('id') userId: string,
		@Query() dto: FindProductsDto
	) {
		return this.productsService.findAllProducts(userId, dto)
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Post()
	public async createProduct(
		@Authorized('id') userId: string,
		@Body() dto: ProductDto
	) {
		return this.productsService.createProduct(userId, dto)
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Get(':productId')
	public async findProductById(
		@Authorized('id') userId: string,
		@Param('productId') productId: string
	) {
		return this.productsService.findProductById(userId, productId)
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Patch(':productId')
	public async updateProduct(
		@Authorized('id') userId: string,
		@Param('productId') productId: string,
		@Body() dto: ProductDto
	) {
		return this.productsService.updateProduct(userId, productId, dto)
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Delete(':productId')
	public async deleteProduct(
		@Authorized('id') userId: string,
		@Param('productId') productId: string
	) {
		return this.productsService.deleteProduct(userId, productId)
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Get('expiring')
	public async expiringSoonProducts(
		@Authorized('id') userId: string,
		@Query() days = '3'
	) {
		return this.productsService.expiringSoonProducts(userId, days)
	}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Post(':productId/consume')
	public async consumeProduct(
		@Authorized('id') userId: string,
		@Param('productId') productId: string,
		@Body() dto: ConsumeProductDto
	) {
		return this.productsService.consumeProduct(userId, productId, dto)
	}
}
