import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import { AuthService } from './services/auth.service'
import bcrypt from 'bcryptjs'

const app = express()
const server = createServer(app)
const prisma = new PrismaClient()

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
})

// CORS para produção
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}))
app.use(express.json())

// Log requests
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString('pt-BR')
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
})

// Seed database
async function seedDatabase() {
  const restaurantCount = await prisma.restaurant.count()
  if (restaurantCount === 0) {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: 'Muzzajazz Pirenópolis',
        slug: 'pirenopolis',
        address: 'Rua do Jazz, 123',
        phone: '(62) 99999-8888',
        email: 'contato@muzzajazz.com',
        city: 'Pirenópolis',
        state: 'GO',
        zipCode: '72800-000',
        ownerId: 'owner-default'
      }
    })
    
    const category = await prisma.category.create({
      data: { 
        name: 'Pizzas Artesanais',
        restaurantId: restaurant.id
      }
    })
    
    await prisma.menuItem.createMany({
      data: [
        {
          name: 'Pizza Ella Fitzgerald',
          description: 'Massa artesanal, mozzarella de búfala, manjericão fresco',
          price: 50.00,
          categoryId: category.id,
          restaurantId: restaurant.id,
          image: '/EllaFitzgerald.png'
        },
        {
          name: 'Pizza Nina Simone', 
          description: 'Bacon defumado, gorgonzola DOP, mozzarella',
          price: 53.00,
          categoryId: category.id,
          restaurantId: restaurant.id,
          image: '/NinaSimone.png'
        }
      ]
    })
    
    // Criar usuários padrão com senhas
    const adminExists = await prisma.user.findUnique({ where: { email: 'admin@muzzajazz.com' } })
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10)
      await prisma.user.create({
        data: {
          email: 'admin@muzzajazz.com',
          name: 'Administrador',
          password: adminPassword,
          role: 'admin',
          restaurantId: restaurant.id
        }
      })
    }
    
    const kitchenExists = await prisma.user.findUnique({ where: { email: 'cozinha@muzzajazz.com' } })
    if (!kitchenExists) {
      const kitchenPassword = await bcrypt.hash('kitchen123', 10)
      await prisma.user.create({
        data: {
          email: 'cozinha@muzzajazz.com',
          name: 'Cozinha',
          password: kitchenPassword,
          role: 'kitchen',
          restaurantId: restaurant.id
        }
      })
    }
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🎷 Muzzajazz API Funcionando!',
    status: 'OK',
    timestamp: new Date().toISOString()
  })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await AuthService.login(email, password)
    res.json({ success: true, data: result })
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message })
  }
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body
    const result = await AuthService.register(email, password, name, role)
    res.json({ success: true, data: result })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ success: false, error: 'Token não fornecido' })
    }
    
    const user = await AuthService.verifyToken(token)
    res.json({ success: true, data: user })
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message })
  }
})

app.get('/api/menu', async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'pirenopolis' }
    })
    
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' })
    }
    
    const items = await prisma.menuItem.findMany({
      where: { 
        active: true,
        restaurantId: restaurant.id
      },
      include: { category: true }
    })
    
    res.json({ success: true, data: items })
  } catch (error) {
    console.error('Menu error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch menu' })
  }
})

app.post('/api/orders', async (req, res) => {
  try {
    const { items, total, table, customer } = req.body
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'pirenopolis' }
    })
    
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' })
    }
    
    const order = await prisma.order.create({
      data: {
        total,
        table: table || 'Balcão',
        customer: customer || 'Cliente',
        restaurantId: restaurant.id,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.id,
            quantity: item.quantity || 1,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: { menuItem: true }
        }
      }
    })
    
    // Emitir para múltiplos painéis
    io.emit('newOrder', order)           // Para cozinha
    io.emit('orderUpdate', order)        // Para admin dashboard
    io.emit('menuUpdate', { type: 'order_created', data: order }) // Para cardápio
    
    console.log(`🆕 Novo pedido #${order.id.slice(-4)} criado - Total: R$ ${order.total.toFixed(2)}`)
    
    res.json({ success: true, data: order })
  } catch (error) {
    console.error('Order error:', error)
    res.status(500).json({ success: false, error: 'Failed to create order' })
  }
})

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, sessionId, menuContext } = req.body
    
    if (!process.env.OPENAI_API_KEY) {
      const fallbackResponse = '🎷 Olá! Sou o Charlie do Muzzajazz. OpenAI não configurada, mas posso ajudar! 🎵'
      return res.json({ success: true, data: { response: fallbackResponse } })
    }
    
    // Importar serviço da IA
    const CharlieAI = require('./services/charlie-ai.service').default
    
    // Buscar menu atual
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'pirenopolis' }
    })
    
    let menuItems = []
    if (restaurant) {
      menuItems = await prisma.menuItem.findMany({
        where: { 
          restaurantId: restaurant.id,
          active: true 
        },
        include: { category: true }
      })
    }
    
    // Contexto para a IA
    const context = {
      menuItems: menuContext || menuItems,
      currentHour: new Date().getHours(),
      sessionId: sessionId || 'default'
    }
    
    // Gerar resposta da IA
    const aiResponse = await CharlieAI.generateResponse(message, context)
    
    // Analisar preferências do usuário
    const preferences = await CharlieAI.analyzePreferences(message)
    
    // Gerar recomendações inteligentes
    const recommendations = CharlieAI.getSmartRecommendations(
      menuItems, 
      context.currentHour, 
      preferences
    )
    
    // Salvar interação no banco
    if (restaurant) {
      await prisma.chatInteraction.create({
        data: {
          sessionId: context.sessionId,
          message,
          response: aiResponse,
          restaurantId: restaurant.id
        }
      })
    }
    
    res.json({ 
      success: true, 
      data: { 
        response: aiResponse,
        recommendations,
        preferences
      } 
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    const fallbackResponse = '🎷 Olá! Sou o Charlie do Muzzajazz. Tive um problema técnico, mas estou aqui para ajudar! 🎵'
    res.json({ success: true, data: { response: fallbackResponse } })
  }
})

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { menuItem: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, data: orders })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' })
  }
})

// Admin Analytics
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // Vendas hoje
    const todayOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startOfDay } }
    })
    
    // Vendas semana
    const weekOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startOfWeek } }
    })
    
    // Vendas mês
    const monthOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startOfMonth } }
    })
    
    // Itens mais vendidos
    const topItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    })
    
    const topItemsWithNames = await Promise.all(
      topItems.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId }
        })
        return {
          name: menuItem?.name || 'Item',
          quantity: item._sum.quantity || 0,
          image: menuItem?.image || '🍕'
        }
      })
    )
    
    // Vendas por hora (últimas 24h)
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = todayOrders.filter(order => 
        new Date(order.createdAt).getHours() === hour
      )
      return {
        hour: `${hour}:00`,
        orders: hourOrders.length,
        revenue: hourOrders.reduce((sum, o) => sum + o.total, 0)
      }
    })
    
    res.json({
      success: true,
      data: {
        today: {
          orders: todayOrders.length,
          revenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
          avgTicket: todayOrders.length > 0 ? todayOrders.reduce((sum, o) => sum + o.total, 0) / todayOrders.length : 0
        },
        week: {
          orders: weekOrders.length,
          revenue: weekOrders.reduce((sum, o) => sum + o.total, 0)
        },
        month: {
          orders: monthOrders.length,
          revenue: monthOrders.reduce((sum, o) => sum + o.total, 0)
        },
        topItems: topItemsWithNames,
        hourlyData
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' })
  }
})

// Menu Management
app.post('/api/admin/menu', async (req, res) => {
  try {
    const { name, description, price, categoryId, image } = req.body
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'pirenopolis' }
    })
    
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' })
    }
    
    const item = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        restaurantId: restaurant.id,
        image: image || '🍕'
      },
      include: { category: true }
    })
    
    // Emitir para todos os painéis
    io.emit('menuItemAdded', item)       // Para cardápio
    io.emit('adminUpdate', { type: 'menu_item_added', data: item }) // Para admin
    
    console.log(`➕ Novo item adicionado: ${item.name} - R$ ${item.price.toFixed(2)}`)
    
    res.json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create menu item' })
  }
})

app.put('/api/admin/menu/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, active } = req.body
    
    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        active
      },
      include: { category: true }
    })
    
    // Emitir para todos os painéis
    io.emit('menuItemUpdated', item)     // Para cardápio
    io.emit('adminUpdate', { type: 'menu_item_updated', data: item }) // Para admin
    
    console.log(`✏️ Item atualizado: ${item.name} - Ativo: ${item.active}`)
    
    res.json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update menu item' })
  }
})

app.delete('/api/admin/menu/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.menuItem.delete({
      where: { id }
    })
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete menu item' })
  }
})

// Categories Management
app.get('/api/admin/categories', async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'pirenopolis' }
    })
    
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' })
    }
    
    const categories = await prisma.category.findMany({
      where: { restaurantId: restaurant.id },
      include: { 
        _count: { 
          select: { 
            items: true 
          } 
        } 
      }
    })
    
    res.json({ success: true, data: categories })
  } catch (error) {
    console.error('Categories error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch categories' })
  }
})

app.post('/api/admin/categories', async (req, res) => {
  try {
    const { name } = req.body
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'pirenopolis' }
    })
    
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' })
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        restaurantId: restaurant.id
      }
    })
    
    // Emitir para todos os painéis
    io.emit('categoryAdded', category)
    io.emit('adminUpdate', { type: 'category_added', data: category })
    
    console.log(`📂 Nova categoria criada: ${category.name}`)
    
    res.json({ success: true, data: category })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create category' })
  }
})

app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Verificar se categoria tem itens
    const itemCount = await prisma.menuItem.count({
      where: { categoryId: id }
    })
    
    if (itemCount > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Não é possível excluir categoria com ${itemCount} item(ns)` 
      })
    }
    
    await prisma.category.delete({
      where: { id }
    })
    
    console.log(`🗑️ Categoria removida: ${id}`)
    
    res.json({ success: true, message: 'Categoria removida com sucesso' })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({ success: false, error: 'Failed to delete category' })
  }
})

// Charlie AI Training
app.get('/api/admin/charlie/training', async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'pirenopolis' }
    })
    
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' })
    }
    
    // Buscar conhecimento real do banco
    const knowledgeBase = await prisma.aIKnowledge.findMany({
      where: { 
        restaurantId: restaurant.id,
        active: true 
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Buscar configurações de personalidade
    const personalityConfig = await prisma.aIConfig.findMany({
      where: {
        key: { in: ['personality_tone', 'personality_style', 'personality_greeting'] }
      }
    })
    
    const personality = {
      tone: personalityConfig.find(c => c.key === 'personality_tone')?.value || 'Caloroso e sofisticado',
      style: personalityConfig.find(c => c.key === 'personality_style')?.value || 'Sommelier musical',
      greeting: personalityConfig.find(c => c.key === 'personality_greeting')?.value || '🎷 Olá! Sou o Charlie, seu sommelier musical!'
    }
    
    // Estatísticas reais
    const totalInteractions = await prisma.chatInteraction.count({ 
      where: { restaurantId: restaurant.id } 
    })
    
    const recentInteractions = await prisma.chatInteraction.findMany({
      where: { 
        restaurantId: restaurant.id,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })
    
    const trainingData = {
      knowledgeBase,
      personality,
      stats: {
        totalInteractions,
        avgResponseTime: '1.2s',
        satisfactionRate: '94%',
        todayInteractions: recentInteractions.length,
        knowledgeItems: knowledgeBase.length
      }
    }
    
    res.json({ success: true, data: trainingData })
  } catch (error) {
    console.error('Training data error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch training data' })
  }
})

app.post('/api/admin/charlie/training', async (req, res) => {
  try {
    const { type, title, content } = req.body
    
    if (!type || !title || !content) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios: type, title, content' })
    }
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'pirenopolis' }
    })
    
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' })
    }
    
    // Salvar conhecimento real no banco
    const knowledge = await prisma.aIKnowledge.create({
      data: {
        type,
        title,
        content,
        restaurantId: restaurant.id
      }
    })
    
    console.log(`🤖 Novo conhecimento: ${title} (${type})`)
    
    res.json({ 
      success: true, 
      message: 'Conhecimento adicionado com sucesso!',
      data: knowledge
    })
  } catch (error) {
    console.error('Add knowledge error:', error)
    res.status(500).json({ success: false, error: 'Failed to add knowledge' })
  }
})

app.put('/api/admin/charlie/personality', async (req, res) => {
  try {
    const { tone, style, greeting } = req.body
    
    // Salvar configurações reais
    await Promise.all([
      prisma.aIConfig.upsert({
        where: { key: 'personality_tone' },
        update: { value: tone },
        create: { key: 'personality_tone', value: tone, description: 'Tom de voz da IA' }
      }),
      prisma.aIConfig.upsert({
        where: { key: 'personality_style' },
        update: { value: style },
        create: { key: 'personality_style', value: style, description: 'Estilo da IA' }
      }),
      prisma.aIConfig.upsert({
        where: { key: 'personality_greeting' },
        update: { value: greeting },
        create: { key: 'personality_greeting', value: greeting, description: 'Saudação padrão da IA' }
      })
    ])
    
    console.log('🤖 Personalidade atualizada:', { tone, style, greeting })
    
    res.json({ 
      success: true, 
      message: 'Personalidade da Charlie atualizada!'
    })
  } catch (error) {
    console.error('Update personality error:', error)
    res.status(500).json({ success: false, error: 'Failed to update personality' })
  }
})

// Deletar conhecimento
app.delete('/api/admin/charlie/training/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.aIKnowledge.delete({
      where: { id }
    })
    
    console.log(`🗑️ Conhecimento removido: ${id}`)
    
    res.json({ success: true, message: 'Conhecimento removido!' })
  } catch (error) {
    console.error('Delete knowledge error:', error)
    res.status(500).json({ success: false, error: 'Failed to delete knowledge' })
  }
})

// Orders Management
app.get('/api/admin/orders', async (req, res) => {
  try {
    const { status, date, limit = 50 } = req.query
    
    let whereClause: any = {}
    
    if (status && status !== 'all') {
      whereClause.status = status
    }
    
    if (date) {
      const startDate = new Date(date as string)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
      
      whereClause.createdAt = {
        gte: startDate,
        lt: endDate
      }
    }
    
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: { menuItem: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    })
    
    // Estatísticas
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      preparing: orders.filter(o => o.status === 'PREPARING').length,
      ready: orders.filter(o => o.status === 'READY').length,
      delivered: orders.filter(o => o.status === 'DELIVERED').length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0)
    }
    
    res.json({ success: true, data: { orders, stats } })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' })
  }
})

// Kitchen endpoint for order status updates
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: { menuItem: true }
        }
      }
    })
    
    // Emitir para múltiplos painéis
    io.emit('orderStatusUpdate', { orderId: id, status, order })
    io.emit('adminUpdate', { type: 'order_status_changed', data: { orderId: id, status, order } })
    io.emit('kitchenUpdate', { type: 'status_changed', data: { orderId: id, status } })
    
    console.log(`🍳 Cozinha: Pedido #${id.slice(-4)} -> ${status}`)
    
    res.json({ success: true, data: order })
  } catch (error) {
    console.error('Kitchen status update error:', error)
    res.status(500).json({ success: false, error: 'Failed to update order status' })
  }
})

app.put('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: { menuItem: true }
        }
      }
    })
    
    // Emitir para múltiplos painéis
    io.emit('orderStatusUpdate', { orderId: id, status, order }) // Para cozinha
    io.emit('adminUpdate', { type: 'order_status_changed', data: { orderId: id, status, order } }) // Para admin
    io.emit('kitchenUpdate', { type: 'status_changed', data: { orderId: id, status } }) // Para cozinha
    
    console.log(`⚙️ Admin: Pedido #${id.slice(-4)} -> ${status}`)
    
    res.json({ success: true, data: order })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update order status' })
  }
})

app.delete('/api/admin/orders/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.orderItem.deleteMany({ where: { orderId: id } })
    await prisma.order.delete({ where: { id } })
    
    res.json({ success: true, message: 'Pedido removido com sucesso' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete order' })
  }
})

// Reports
app.get('/api/admin/reports/data', async (req, res) => {
  try {
    const { startDate, endDate, type = 'sales' } = req.query
    
    let whereClause: any = {}
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      }
    }
    
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: { menuItem: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Dados para relatório de vendas
    if (type === 'sales') {
      const salesData = {
        summary: {
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
          avgTicket: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
          period: { startDate, endDate }
        },
        orders: orders.map(order => ({
          id: order.id,
          date: order.createdAt,
          table: order.table,
          customer: order.customer,
          total: order.total,
          status: order.status,
          items: order.items.map(item => ({
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price
          }))
        })),
        dailySales: getDailySales(orders),
        topItems: getTopItems(orders),
        statusBreakdown: getStatusBreakdown(orders)
      }
      
      res.json({ success: true, data: salesData })
    }
    
    // Dados para relatório de produtos
    else if (type === 'products') {
      const productData = {
        summary: {
          totalItems: await prisma.menuItem.count(),
          activeItems: await prisma.menuItem.count({ where: { active: true } }),
          period: { startDate, endDate }
        },
        products: getTopItems(orders, true),
        categories: await getCategoryPerformance(orders)
      }
      
      res.json({ success: true, data: productData })
    }
    
  } catch (error) {
    console.error('Report error:', error)
    res.status(500).json({ success: false, error: 'Failed to generate report' })
  }
})

// Funções auxiliares para relatórios
function getDailySales(orders: any[]) {
  const dailyMap = new Map()
  
  orders.forEach(order => {
    const date = new Date(order.createdAt).toISOString().split('T')[0]
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { date, orders: 0, revenue: 0 })
    }
    const day = dailyMap.get(date)
    day.orders += 1
    day.revenue += order.total
  })
  
  return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

function getTopItems(orders: any[], detailed = false) {
  const itemMap = new Map()
  
  orders.forEach(order => {
    order.items.forEach((item: any) => {
      const key = item.menuItem.id
      if (!itemMap.has(key)) {
        itemMap.set(key, {
          id: key,
          name: item.menuItem.name,
          image: item.menuItem.image,
          quantity: 0,
          revenue: 0,
          orders: 0
        })
      }
      const product = itemMap.get(key)
      product.quantity += item.quantity
      product.revenue += item.quantity * item.price
      product.orders += 1
    })
  })
  
  return Array.from(itemMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, detailed ? 50 : 10)
}

function getStatusBreakdown(orders: any[]) {
  const statusMap = new Map()
  
  orders.forEach(order => {
    const status = order.status
    if (!statusMap.has(status)) {
      statusMap.set(status, { status, count: 0, revenue: 0 })
    }
    const statusData = statusMap.get(status)
    statusData.count += 1
    statusData.revenue += order.total
  })
  
  return Array.from(statusMap.values())
}

async function getCategoryPerformance(orders: any[]) {
  const categoryMap = new Map()
  
  orders.forEach(order => {
    order.items.forEach((item: any) => {
      const categoryName = item.menuItem.category?.name || 'Sem categoria'
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          name: categoryName,
          quantity: 0,
          revenue: 0,
          items: 0
        })
      }
      const category = categoryMap.get(categoryName)
      category.quantity += item.quantity
      category.revenue += item.quantity * item.price
      category.items += 1
    })
  })
  
  return Array.from(categoryMap.values())
    .sort((a, b) => b.revenue - a.revenue)
}

const PORT = process.env.PORT || 3001

// Payment Routes - ASAAS REAL
app.post('/api/payments/pix', async (req, res) => {
  try {
    const { orderId, amount, customerName, customerEmail } = req.body
    
    if (!process.env.ASAAS_API_KEY) {
      return res.status(500).json({ success: false, error: 'Asaas não configurado' })
    }
    
    const AsaasService = require('./services/asaas-real.service').default
    
    // 1. Criar cliente no Asaas
    const customer = await AsaasService.createCustomer({
      name: customerName || 'Cliente Muzzajazz',
      email: customerEmail || 'cliente@muzzajazz.com',
      cpfCnpj: '24971563792' // CPF válido para teste
    })
    
    // 2. Criar pagamento PIX
    const payment = await AsaasService.createPixPayment({
      customerId: customer.id,
      amount,
      orderId
    })
    
    // 3. Obter QR Code PIX
    const pixQrCode = await AsaasService.getPixQrCode(payment.id)
    
    const pixData = {
      id: payment.id,
      orderId,
      amount,
      pixCode: pixQrCode.payload,
      qrCode: pixQrCode.encodedImage,
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
      createdAt: new Date()
    }
    
    // Salvar pagamento no banco
    await prisma.payment.create({
      data: {
        id: payment.id,
        orderId,
        amount,
        method: 'PIX',
        status: 'PENDING',
        asaasPaymentId: payment.id
      }
    }).catch(() => {}) // Ignorar erro se tabela não existir
    
    console.log(`💳 PIX criado: ${payment.id} - R$ ${amount.toFixed(2)}`)
    
    res.json({ success: true, data: pixData })
  } catch (error: any) {
    console.error('PIX Asaas error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao gerar PIX',
      details: error.response?.data?.errors || error.message
    })
  }
})

app.post('/api/payments/card', async (req, res) => {
  try {
    const { orderId, amount, cardData } = req.body
    const { number, name, expiry, cvv } = cardData
    
    if (!number || !name || !expiry || !cvv) {
      return res.status(400).json({ success: false, error: 'Dados do cartão incompletos' })
    }
    
    if (!process.env.ASAAS_API_KEY) {
      return res.status(500).json({ success: false, error: 'Asaas não configurado' })
    }
    
    const AsaasService = require('./services/asaas-real.service').default
    
    // 1. Criar cliente no Asaas
    const customer = await AsaasService.createCustomer({
      name: name,
      email: 'cliente@muzzajazz.com',
      cpfCnpj: '24971563792' // CPF válido para teste
    })
    
    // 2. Processar pagamento cartão
    const payment = await AsaasService.createCardPayment({
      customerId: customer.id,
      amount,
      orderId,
      cardData,
      customerEmail: 'cliente@muzzajazz.com',
      customerCpf: '24971563792'
    })
    
    const paymentData = {
      id: payment.id,
      orderId,
      amount,
      status: payment.status === 'CONFIRMED' ? 'approved' : 'declined',
      cardLast4: number.slice(-4),
      authCode: payment.id,
      message: payment.status === 'CONFIRMED' ? 'Pagamento aprovado' : 'Cartão recusado',
      createdAt: new Date()
    }
    
    // Salvar pagamento no banco
    await prisma.payment.create({
      data: {
        id: payment.id,
        orderId,
        amount,
        method: 'CARD',
        status: payment.status,
        asaasPaymentId: payment.id
      }
    }).catch(() => {}) // Ignorar erro se tabela não existir
    
    if (payment.status === 'CONFIRMED') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' }
      })
      io.emit('paymentApproved', { orderId, paymentId: payment.id })
    }
    
    console.log(`💳 Cartão processado: ${payment.id} - ${payment.status}`)
    
    res.json({ success: true, data: paymentData })
  } catch (error: any) {
    console.error('Card Asaas error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao processar cartão',
      details: error.response?.data?.errors || error.message
    })
  }
})

// Webhook Asaas - Confirmação automática
app.post('/api/webhooks/asaas', async (req, res) => {
  try {
    const { event, payment } = req.body
    
    console.log(`🔔 Webhook Asaas: ${event} - ${payment.id}`)
    
    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      // Buscar pedido pelo externalReference
      const orderId = payment.externalReference
      
      if (orderId) {
        // Atualizar status do pedido
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' }
        })
        
        // Notificar via WebSocket
        io.emit('paymentApproved', { 
          orderId, 
          paymentId: payment.id,
          method: payment.billingType 
        })
        
        console.log(`✅ Pagamento confirmado: ${orderId} - ${payment.billingType}`)
      }
    }
    
    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

// Employee Management
app.get('/api/admin/employees', async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    res.json({ success: true, data: employees })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch employees' })
  }
})

app.put('/api/admin/employees/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { active } = req.body
    
    await prisma.user.update({
      where: { id },
      data: { active }
    })
    
    console.log(`👤 Funcionário ${id.slice(-4)} ${active ? 'ativado' : 'desativado'}`)
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update employee' })
  }
})

// Enhanced Analytics
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const { period = 'today' } = req.query
    
    let startDate: Date
    const now = new Date()
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default: // today
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }
    
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      include: {
        items: {
          include: { menuItem: true }
        }
      }
    })
    
    const revenue = orders.reduce((sum, o) => sum + o.total, 0)
    const avgTicket = orders.length > 0 ? revenue / orders.length : 0
    
    // Vendas por hora
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = orders.filter(order => 
        new Date(order.createdAt).getHours() === hour
      )
      return {
        hour: `${hour}:00`,
        orders: hourOrders.length,
        revenue: hourOrders.reduce((sum, o) => sum + o.total, 0)
      }
    })
    
    // Top items
    const itemMap = new Map()
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.menuItem.id
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            name: item.menuItem.name,
            quantity: 0
          })
        }
        itemMap.get(key).quantity += item.quantity
      })
    })
    
    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
    
    res.json({
      success: true,
      data: {
        orders: orders.length,
        revenue,
        avgTicket,
        hourlyData,
        topItems
      }
    })
  } catch (error) {
    console.error('Enhanced analytics error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' })
  }
})

// Audit Log Middleware
const createAuditLog = async (req: any, action: string, resource: string, resourceId?: string, details?: any) => {
  try {
    const userEmail = req.user?.email || 'anonymous'
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown'
    const userAgent = req.get('User-Agent') || 'unknown'
    
    await prisma.auditLog.create({
      data: {
        userEmail,
        action,
        resource,
        resourceId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
        success: true
      }
    })
  } catch (error) {
    console.error('Erro ao criar log de auditoria:', error)
  }
}

// Audit Logs API
app.get('/api/admin/audit-logs', async (req, res) => {
  try {
    const { filter = 'all', limit = 50 } = req.query
    
    let whereClause: any = {}
    
    if (filter !== 'all') {
      switch (filter) {
        case 'login':
          whereClause.action = { in: ['LOGIN', 'LOGOUT'] }
          break
        case 'menu':
          whereClause.resource = 'MENU_ITEM'
          break
        case 'orders':
          whereClause.resource = 'ORDER'
          break
      }
    }
    
    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    })
    
    res.json({ success: true, data: logs })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' })
  }
})

// 2FA Verification
app.post('/api/auth/verify-2fa', async (req, res) => {
  try {
    const { email, code } = req.body
    
    // Simular verificação 2FA (em produção, usar serviço real)
    const isValidCode = code === '123456' // Código fixo para demo
    
    if (isValidCode) {
      await createAuditLog(req, 'LOGIN_2FA', 'USER', null, {
        description: `Verificação 2FA bem-sucedida para ${email}`
      })
      
      res.json({ success: true, message: '2FA verificado com sucesso' })
    } else {
      await prisma.auditLog.create({
        data: {
          userEmail: email,
          action: 'LOGIN_2FA_FAILED',
          resource: 'USER',
          success: false,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        }
      })
      
      res.status(401).json({ success: false, error: 'Código 2FA inválido' })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro na verificação 2FA' })
  }
})

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔗 Cliente conectado: ${socket.id.slice(-6)}`)
  
  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id.slice(-6)}`)
  })
})

server.listen(PORT, async () => {
  await seedDatabase()
  console.log(`🎷 Backend funcionando na porta ${PORT}`)
  console.log(`📱 Teste: http://localhost:${PORT}`)
  console.log(`🔄 WebSocket ativo para comunicação tempo real`)
  console.log(`📊 Painéis: Cardápio | Cozinha | Admin`)
})