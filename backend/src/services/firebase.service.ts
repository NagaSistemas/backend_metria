import { db } from '../config/firebase';

interface Order {
  id: string;
  status: string;
  total: number;
  items: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class FirebaseService {
  // Orders
  static async createOrder(orderData: Omit<Order, 'id'>) {
    const docRef = await db.collection('orders').add({
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return { id: docRef.id, ...orderData };
  }

  static async getOrders() {
    const snapshot = await db.collection('orders')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  static async updateOrderStatus(orderId: string, status: string) {
    await db.collection('orders').doc(orderId).update({
      status,
      updatedAt: new Date()
    });
    
    const doc = await db.collection('orders').doc(orderId).get();
    return { id: doc.id, ...doc.data() };
  }

  // Menu Items
  static async getMenuItems() {
    const snapshot = await db.collection('menuItems')
      .where('active', '==', true)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  static async createMenuItem(itemData: Omit<MenuItem, 'id'>) {
    const docRef = await db.collection('menuItems').add({
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return { id: docRef.id, ...itemData };
  }

  // Chat Interactions
  static async saveChatInteraction(message: string, response: string, sessionId?: string) {
    await db.collection('chatInteractions').add({
      message,
      response,
      sessionId,
      createdAt: new Date()
    });
  }

  // Analytics
  static async getAnalytics() {
    const ordersSnapshot = await db.collection('orders').get();
    const orders = ordersSnapshot.docs.map(doc => doc.data());
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    return {
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  }
}