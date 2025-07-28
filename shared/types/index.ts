// Tipos compartilhados entre frontend e backend

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  ingredients: string[];
  allergens: string[];
  prepTime: number;
  serves: string;
  rating?: number;
  active: boolean;
  categoryId: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  active: boolean;
  menuItems?: MenuItem[];
}

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  table?: string;
  customer?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: MenuItem;
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
}

export interface ChatInteraction {
  id: string;
  message: string;
  response: string;
  keywords: string[];
  sessionId?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

// Enums
export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CARD = 'CARD',
  PIX = 'PIX',
  CASH = 'CASH'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  KITCHEN = 'KITCHEN'
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Analytics types
export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topItems: Array<{
    item: MenuItem;
    quantity: number;
    revenue: number;
  }>;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
  }>;
}