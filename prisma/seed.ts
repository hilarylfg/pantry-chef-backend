import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'argon2'

import {
	AuthMethod,
	PrismaClient,
	UserRole
} from '../src/generated/prisma/client'

const prisma = new PrismaClient({
	adapter: new PrismaPg({
		connectionString: process.env.POSTGRES_URI
	})
})

const ADMIN_ID = '00000000-0000-0000-0000-000000000001'
const USER_ID = '00000000-0000-0000-0000-000000000002'
const OAUTH_USER_ID = '00000000-0000-0000-0000-000000000003'

const daysFromNow = (days: number) =>
	new Date(Date.now() + days * 24 * 60 * 60 * 1000)

async function seedUsers() {
	const passwordHash = await hash('Password123!')

	await prisma.user.upsert({
		where: { id: ADMIN_ID },
		update: {},
		create: {
			id: ADMIN_ID,
			email: 'admin@pantrychef.ru',
			password: passwordHash,
			displayName: 'Админ PantryChef',
			role: UserRole.ADMIN,
			isVerified: true,
			method: AuthMethod.CREDENTIALS
		}
	})

	await prisma.user.upsert({
		where: { id: USER_ID },
		update: {},
		create: {
			id: USER_ID,
			email: 'anna@pantrychef.ru',
			password: passwordHash,
			displayName: 'Анна Соколова',
			role: UserRole.REGULAR,
			isVerified: true,
			method: AuthMethod.CREDENTIALS
		}
	})

	const oauthPasswordHash = await hash('')
	await prisma.user.upsert({
		where: { id: OAUTH_USER_ID },
		update: {},
		create: {
			id: OAUTH_USER_ID,
			email: 'ivan@gmail.com',
			password: oauthPasswordHash,
			displayName: 'Иван Петров',
			picture: 'https://avatars.githubusercontent.com/u/0?v=4',
			role: UserRole.REGULAR,
			isVerified: true,
			method: AuthMethod.GOOGLE
		}
	})

	await prisma.account.upsert({
		where: {
			provider_providerAccountId: {
				provider: 'google',
				providerAccountId: 'google-100000000000000001'
			}
		},
		update: {},
		create: {
			userId: OAUTH_USER_ID,
			type: 'oauth',
			provider: 'google',
			providerAccountId: 'google-100000000000000001',
			accessToken: 'mock-access-token',
			refreshToken: 'mock-refresh-token',
			expiresAt: Math.floor(Date.now() / 1000) + 3600
		}
	})
}

async function seedProducts() {
	await prisma.product.deleteMany({
		where: {
			userId: { in: [ADMIN_ID, USER_ID, OAUTH_USER_ID] }
		}
	})

	const products = [
		// --- dairy ---
		{
			name: 'Молоко 3.2%',
			category: 'dairy',
			amount: 1,
			unit: 'l',
			expiryDate: daysFromNow(4),
			userId: USER_ID
		},
		{
			name: 'Сыр Гауда',
			category: 'dairy',
			amount: 200,
			unit: 'g',
			expiryDate: daysFromNow(14),
			userId: USER_ID
		},
		{
			name: 'Йогурт натуральный',
			category: 'dairy',
			amount: 4,
			unit: 'piece',
			expiryDate: daysFromNow(2),
			userId: USER_ID
		},
		{
			name: 'Сливочное масло',
			category: 'dairy',
			amount: 180,
			unit: 'g',
			expiryDate: daysFromNow(30),
			userId: USER_ID
		},
		// --- meat / poultry ---
		{
			name: 'Куриная грудка',
			category: 'poultry',
			amount: 500,
			unit: 'g',
			expiryDate: daysFromNow(1),
			userId: USER_ID
		},
		{
			name: 'Говяжий фарш',
			category: 'meat',
			amount: 600,
			unit: 'g',
			expiryDate: daysFromNow(2),
			userId: USER_ID
		},
		// --- fish ---
		{
			name: 'Филе лосося',
			category: 'fish',
			amount: 300,
			unit: 'g',
			expiryDate: daysFromNow(2),
			userId: USER_ID
		},
		// --- eggs ---
		{
			name: 'Яйца С0',
			category: 'eggs',
			amount: 10,
			unit: 'piece',
			expiryDate: daysFromNow(18),
			userId: USER_ID
		},
		// --- vegetables ---
		{
			name: 'Помидоры',
			category: 'vegetables',
			amount: 4,
			unit: 'piece',
			expiryDate: daysFromNow(6),
			userId: USER_ID
		},
		{
			name: 'Огурцы',
			category: 'vegetables',
			amount: 3,
			unit: 'piece',
			expiryDate: daysFromNow(7),
			userId: USER_ID
		},
		{
			name: 'Лук репчатый',
			category: 'vegetables',
			amount: 1,
			unit: 'kg',
			expiryDate: daysFromNow(25),
			userId: USER_ID
		},
		{
			name: 'Чеснок',
			category: 'vegetables',
			amount: 2,
			unit: 'piece',
			expiryDate: daysFromNow(30),
			userId: USER_ID
		},
		{
			name: 'Картофель',
			category: 'vegetables',
			amount: 2,
			unit: 'kg',
			expiryDate: daysFromNow(40),
			userId: USER_ID
		},
		// --- fruits ---
		{
			name: 'Яблоки Гала',
			category: 'fruits',
			amount: 5,
			unit: 'piece',
			expiryDate: daysFromNow(12),
			userId: USER_ID
		},
		{
			name: 'Лимон',
			category: 'fruits',
			amount: 2,
			unit: 'piece',
			expiryDate: daysFromNow(10),
			userId: USER_ID
		},
		// --- grains ---
		{
			name: 'Рис басмати',
			category: 'grains',
			amount: 1,
			unit: 'pack',
			expiryDate: daysFromNow(180),
			userId: USER_ID
		},
		{
			name: 'Гречка',
			category: 'grains',
			amount: 800,
			unit: 'g',
			expiryDate: daysFromNow(180),
			userId: USER_ID
		},
		// --- pasta ---
		{
			name: 'Спагетти',
			category: 'pasta',
			amount: 450,
			unit: 'g',
			expiryDate: daysFromNow(200),
			userId: USER_ID
		},
		// --- oils ---
		{
			name: 'Оливковое масло Extra Virgin',
			category: 'oils',
			amount: 500,
			unit: 'ml',
			expiryDate: daysFromNow(300),
			userId: USER_ID
		},
		// --- sauces ---
		{
			name: 'Соевый соус',
			category: 'sauces',
			amount: 250,
			unit: 'ml',
			expiryDate: daysFromNow(120),
			userId: USER_ID
		},
		// --- spices ---
		{
			name: 'Соль морская',
			category: 'spices',
			amount: 1,
			unit: 'pack',
			expiryDate: daysFromNow(730),
			userId: USER_ID
		},
		{
			name: 'Чёрный перец молотый',
			category: 'spices',
			amount: 50,
			unit: 'g',
			expiryDate: daysFromNow(365),
			userId: USER_ID
		},
		// --- canned ---
		{
			name: 'Томатная паста',
			category: 'canned',
			amount: 1,
			unit: 'jar',
			expiryDate: daysFromNow(150),
			userId: USER_ID
		},
		{
			name: 'Консервированный тунец',
			category: 'canned',
			amount: 2,
			unit: 'jar',
			expiryDate: daysFromNow(200),
			userId: USER_ID
		},
		// --- хлеб/выпечка ---
		{
			name: 'Хлеб ржаной',
			category: 'bread',
			amount: 1,
			unit: 'piece',
			expiryDate: daysFromNow(3),
			userId: USER_ID
		}
	]

	await prisma.product.createMany({ data: products })
}

async function seedRecipes() {
	await prisma.recipe.deleteMany({
		where: {
			userId: { in: [USER_ID, OAUTH_USER_ID] }
		}
	})

	await prisma.recipe.create({
		data: {
			userId: USER_ID,
			title: 'Паста с курицей и томатами',
			isFavorite: true,
			ingredients: [
				{
					name: 'Спагетти',
					amount: 200,
					unit: 'g',
					fromPantry: true
				},
				{
					name: 'Куриная грудка',
					amount: 250,
					unit: 'g',
					fromPantry: true
				},
				{
					name: 'Помидоры',
					amount: 3,
					unit: 'piece',
					fromPantry: true
				},
				{
					name: 'Чеснок',
					amount: 2,
					unit: 'piece',
					fromPantry: true
				},
				{
					name: 'Оливковое масло Extra Virgin',
					amount: 2,
					unit: 'tbsp',
					fromPantry: true
				},
				{
					name: 'Соль морская',
					amount: 1,
					unit: 'tsp',
					fromPantry: true
				},
				{
					name: 'Базилик свежий',
					amount: 1,
					unit: 'pack',
					fromPantry: false,
					substitute: 'Сушёный базилик (1 ч.л.)'
				}
			],
			steps: [
				{
					order: 1,
					description:
						'Отварите спагетти в подсоленной воде до состояния аль денте согласно инструкции на упаковке.',
					durationMinutes: 10
				},
				{
					order: 2,
					description:
						'Куриную грудку нарежьте небольшими кубиками, посолите и поперчите.',
					durationMinutes: 5
				},
				{
					order: 3,
					description:
						'Разогрейте оливковое масло на сковороде и обжарьте курицу до золотистой корочки.',
					durationMinutes: 7,
					tip: 'Не пережарьте — внутри мясо должно остаться сочным.'
				},
				{
					order: 4,
					description:
						'Добавьте измельчённый чеснок и нарезанные помидоры, тушите 5 минут.',
					durationMinutes: 5
				},
				{
					order: 5,
					description:
						'Смешайте готовую пасту с соусом, украсьте базиликом и подавайте.',
					durationMinutes: 2
				}
			]
		}
	})

	await prisma.recipe.create({
		data: {
			userId: USER_ID,
			title: 'Омлет с сыром и зеленью',
			isFavorite: false,
			ingredients: [
				{
					name: 'Яйца С0',
					amount: 3,
					unit: 'piece',
					fromPantry: true
				},
				{
					name: 'Молоко 3.2%',
					amount: 50,
					unit: 'ml',
					fromPantry: true
				},
				{
					name: 'Сыр Гауда',
					amount: 50,
					unit: 'g',
					fromPantry: true
				},
				{
					name: 'Сливочное масло',
					amount: 10,
					unit: 'g',
					fromPantry: true
				},
				{
					name: 'Соль морская',
					amount: 1,
					unit: 'pinch',
					fromPantry: true
				}
			],
			steps: [
				{
					order: 1,
					description:
						'Взбейте яйца с молоком и щепоткой соли до однородности.',
					durationMinutes: 3
				},
				{
					order: 2,
					description:
						'Растопите сливочное масло на разогретой сковороде.',
					durationMinutes: 1
				},
				{
					order: 3,
					description:
						'Вылейте яичную смесь и готовьте на слабом огне под крышкой.',
					durationMinutes: 5,
					tip: 'Не перемешивайте — омлет поднимется равномернее.'
				},
				{
					order: 4,
					description:
						'За минуту до готовности посыпьте тёртым сыром и подавайте.',
					durationMinutes: 1
				}
			]
		}
	})

	await prisma.recipe.create({
		data: {
			userId: OAUTH_USER_ID,
			title: 'Гречка с говяжьим фаршем',
			isFavorite: true,
			ingredients: [
				{
					name: 'Гречка',
					amount: 200,
					unit: 'g',
					fromPantry: true
				},
				{
					name: 'Говяжий фарш',
					amount: 300,
					unit: 'g',
					fromPantry: true
				},
				{
					name: 'Лук репчатый',
					amount: 1,
					unit: 'piece',
					fromPantry: true
				},
				{
					name: 'Оливковое масло Extra Virgin',
					amount: 2,
					unit: 'tbsp',
					fromPantry: true
				},
				{
					name: 'Чёрный перец молотый',
					amount: 1,
					unit: 'pinch',
					fromPantry: true
				}
			],
			steps: [
				{
					order: 1,
					description:
						'Промойте гречку и залейте водой в соотношении 1:2, доведите до кипения и варите 15 минут.',
					durationMinutes: 15
				},
				{
					order: 2,
					description:
						'Мелко нарежьте лук и обжарьте на масле до прозрачности.',
					durationMinutes: 4
				},
				{
					order: 3,
					description:
						'Добавьте фарш, обжаривайте, помешивая, до готовности около 8 минут.',
					durationMinutes: 8
				},
				{
					order: 4,
					description:
						'Соедините фарш с гречкой, приправьте перцем и подавайте.',
					durationMinutes: 2
				}
			]
		}
	})
}

async function main() {
	console.log('🌱 Seeding PantryChef...')
	await seedUsers()
	console.log('✅ Users seeded')
	await seedProducts()
	console.log('✅ Products seeded')
	await seedRecipes()
	console.log('✅ Recipes seeded')
	console.log('🎉 Seed completed')
}

main()
	.catch(e => {
		console.error('❌ Seed failed:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
