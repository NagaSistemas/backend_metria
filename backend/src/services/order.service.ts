import { PrismaClient } from '@prisma/client';
import { io } from '../server';

enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

const prisma = new PrismaClient();

export class OrderService {
  static async createOrder(orderData: {
    items: Array<{ menuItemId: string; quantity: number; price: number }>;
    total: number;
    table?: string;
    customer?: string;
    notes?: string;
  }) {
    const order = await prisma.order.create({
      data: {
        total: orderData.total,
        table: orderData.table,
        customer: orderData.customer,
        notes: orderData.notes,
        items: {
          create: orderData.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // Notificar cozinha via WebSocket
    io.emit('newOrder', order);
    
    return order;
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // Notificar mudança de status
    io.emit('orderStatusUpdate', { orderId, status, order });
    
    return order;
  }

  static async getOrders(filters?: {
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    });

    return orders;
  }

  static async getOrderById(orderId: string) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        payments: true
      }
    });
  }

  static async getKitchenOrders() {
    return await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY]
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}