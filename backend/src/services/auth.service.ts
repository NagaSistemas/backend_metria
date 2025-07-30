import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class AuthService {
  static async login(email: string, password: string) {
    try {
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email },
        include: { restaurant: true }
      })

      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      // Verificar senha com hash
      if (!user.password) {
        throw new Error('Usuário sem senha configurada')
      }
      
      const validPassword = await bcrypt.compare(password, user.password)
      
      if (!validPassword) {
        throw new Error('Senha incorreta')
      }

      // Gerar token
      const token = jwt.sign(
        { 
          uid: user.id, 
          email: user.email, 
          role: user.role,
          restaurantId: user.restaurantId 
        },
        process.env.JWT_SECRET || 'muzzajazz-secret',
        { expiresIn: '24h' }
      )

      return {
        user: {
          uid: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId
        },
        token
      }
    } catch (error) {
      throw error
    }
  }

  static async register(email: string, password: string, name: string, role: string = 'kitchen') {
    try {
      // Verificar se usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        throw new Error('Usuário já existe')
      }

      // Buscar restaurante padrão
      const restaurant = await prisma.restaurant.findFirst()
      
      if (!restaurant) {
        throw new Error('Restaurante não encontrado')
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Criar usuário
      const user = await prisma.user.create({
        data: {
          email,
          name,
          role,
          password: hashedPassword,
          restaurantId: restaurant.id
        }
      })

      // Gerar token
      const token = jwt.sign(
        { 
          uid: user.id, 
          email: user.email, 
          role: user.role,
          restaurantId: user.restaurantId 
        },
        process.env.JWT_SECRET || 'muzzajazz-secret',
        { expiresIn: '24h' }
      )

      return {
        user: {
          uid: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId
        },
        token
      }
    } catch (error) {
      throw error
    }
  }

  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'muzzajazz-secret') as any
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.uid }
      })

      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      return {
        uid: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId
      }
    } catch (error) {
      throw new Error('Token inválido')
    }
  }
}