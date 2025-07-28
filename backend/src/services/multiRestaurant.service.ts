import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class MultiRestaurantService {
  // Criar novo restaurante
  static async createRestaurant(data: {
    name: string
    slug: string
    address: string
    phone: string
    email: string
    city: string
    state: string
    zipCode: string
    ownerId: string
    theme?: any
    settings?: any
  }) {
    try {
      // Verificar se slug já existe
      const existing = await prisma.restaurant.findUnique({
        where: { slug: data.slug }
      })
      
      if (existing) {
        return { success: false, error: 'Slug já existe' }
      }

      const restaurant = await prisma.restaurant.create({
        data: {
          ...data,
          theme: data.theme ? JSON.stringify(data.theme) : null,
          settings: data.settings ? JSON.stringify(data.settings) : null
        }
      })

      // Criar categorias padrão
      await this.createDefaultCategories(restaurant.id)
      
      // Criar itens de menu padrão
      await this.createDefaultMenuItems(restaurant.id)

      return { success: true, data: restaurant }
    } catch (error) {
      console.error('Erro ao criar restaurante:', error)
      return { success: false, error: 'Erro ao criar restaurante' }
    }
  }

  // Listar todos os restaurantes
  static async getAllRestaurants() {
    try {
      const restaurants = await prisma.restaurant.findMany({
        include: {
          _count: {
            select: {
              orders: true,
              menuItems: true,
              users: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return { success: true, data: restaurants }
    } catch (error) {
      return { success: false, error: 'Erro ao buscar restaurantes' }
    }
  }

  // Obter restaurante por slug
  static async getRestaurantBySlug(slug: string) {
    try {
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        include: {
          categories: {
            include: {
              items: {
                where: { active: true }
              }
            }
          }
        }
      })

      if (!restaurant) {
        return { success: false, error: 'Restaurante não encontrado' }
      }

      // Parse JSON fields
      const parsedRestaurant = {
        ...restaurant,
        theme: restaurant.theme ? JSON.parse(restaurant.theme) : null,
        settings: restaurant.settings ? JSON.parse(restaurant.settings) : null
      }

      return { success: true, data: parsedRestaurant }
    } catch (error) {
      return { success: false, error: 'Erro ao buscar restaurante' }
    }
  }

  // Analytics consolidado
  static async getConsolidatedAnalytics() {
    try {
      const restaurants = await prisma.restaurant.findMany({
        include: {
          orders: {
            include: {
              items: true,
              payment: true
            }
          },
          chatInteractions: true
        }
      })

      const analytics = restaurants.map(restaurant => {
        const orders = restaurant.orders
        const totalOrders = orders.length
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
        const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0
        const chatInteractions = restaurant.chatInteractions.length

        return {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          city: restaurant.city,
          totalOrders,
          totalRevenue,
          avgTicket,
          chatInteractions,
          lastOrder: orders.length > 0 ? orders[orders.length - 1].createdAt : null
        }
      })

      // Totais globais
      const globalTotals = {
        totalRestaurants: restaurants.length,
        totalOrders: analytics.reduce((sum, a) => sum + a.totalOrders, 0),
        totalRevenue: analytics.reduce((sum, a) => sum + a.totalRevenue, 0),
        totalChatInteractions: analytics.reduce((sum, a) => sum + a.chatInteractions, 0),
        avgTicketGlobal: analytics.length > 0 ? 
          analytics.reduce((sum, a) => sum + a.avgTicket, 0) / analytics.length : 0
      }

      return {
        success: true,
        data: {
          restaurants: analytics,
          global: globalTotals
        }
      }
    } catch (error) {
      return { success: false, error: 'Erro no analytics consolidado' }
    }
  }

  // Atualizar tema do restaurante
  static async updateRestaurantTheme(restaurantId: string, theme: any) {
    try {
      const restaurant = await prisma.restaurant.update({
        where: { id: restaurantId },
        data: { theme: JSON.stringify(theme) }
      })

      return { success: true, data: restaurant }
    } catch (error) {
      return { success: false, error: 'Erro ao atualizar tema' }
    }
  }

  // Duplicar restaurante (template)
  static async duplicateRestaurant(sourceId: string, newData: {
    name: string
    slug: string
    address: string
    phone: string
    email: string
    city: string
    state: string
    zipCode: string
    ownerId: string
  }) {
    try {
      // Buscar restaurante origem
      const source = await prisma.restaurant.findUnique({
        where: { id: sourceId },
        include: {
          categories: {
            include: {
              items: true
            }
          }
        }
      })

      if (!source) {
        return { success: false, error: 'Restaurante origem não encontrado' }
      }

      // Criar novo restaurante
      const newRestaurant = await prisma.restaurant.create({
        data: {
          ...newData,
          theme: source.theme,
          settings: source.settings
        }
      })

      // Duplicar categorias e itens
      for (const category of source.categories) {
        const newCategory = await prisma.category.create({
          data: {
            name: category.name,
            restaurantId: newRestaurant.id
          }
        })

        // Duplicar itens da categoria
        for (const item of category.items) {
          await prisma.menuItem.create({
            data: {
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.image,
              categoryId: newCategory.id,
              restaurantId: newRestaurant.id
            }
          })
        }
      }

      return { success: true, data: newRestaurant }
    } catch (error) {
      return { success: false, error: 'Erro ao duplicar restaurante' }
    }
  }

  // Criar categorias padrão
  private static async createDefaultCategories(restaurantId: string) {
    const categories = [
      { name: 'Pizzas Artesanais' },
      { name: 'Entradas' },
      { name: 'Bebidas' },
      { name: 'Sobremesas' }
    ]

    for (const category of categories) {
      await prisma.category.create({
        data: {
          ...category,
          restaurantId
        }
      })
    }
  }

  // Criar itens de menu padrão
  private static async createDefaultMenuItems(restaurantId: string) {
    const pizzaCategory = await prisma.category.findFirst({
      where: { restaurantId, name: 'Pizzas Artesanais' }
    })

    const entradasCategory = await prisma.category.findFirst({
      where: { restaurantId, name: 'Entradas' }
    })

    if (pizzaCategory) {
      await prisma.menuItem.createMany({
        data: [
          {
            name: 'Pizza Ella Fitzgerald',
            description: 'Massa artesanal, mozzarella de búfala, manjericão fresco',
            price: 50.00,
            categoryId: pizzaCategory.id,
            restaurantId,
            image: '🍕'
          },
          {
            name: 'Pizza Nina Simone',
            description: 'Bacon defumado, gorgonzola DOP, mozzarella',
            price: 53.00,
            categoryId: pizzaCategory.id,
            restaurantId,
            image: '🍕'
          }
        ]
      })
    }

    if (entradasCategory) {
      await prisma.menuItem.create({
        data: {
          name: 'Bruschetta Jazz',
          description: 'Pão artesanal, tomate, manjericão, azeite especial',
          price: 25.00,
          categoryId: entradasCategory.id,
          restaurantId,
          image: '🥖'
        }
      })
    }
  }

  // Middleware para extrair restaurantId da URL
  static extractRestaurantFromRequest(req: any): string | null {
    // Extrair de subdomínio: pirenopolis.muzzajazz.com
    const host = req.get('host') || ''
    const subdomain = host.split('.')[0]
    
    // Ou extrair de path: /r/pirenopolis
    const pathMatch = req.path.match(/^\/r\/([^\/]+)/)
    
    return pathMatch ? pathMatch[1] : (subdomain !== 'localhost' && subdomain !== 'www' ? subdomain : null)
  }
}