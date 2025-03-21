
const storage = {
  getItem: (key: string) => {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch (e) {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (e) {
      return Promise.resolve();
    }
  }
};
import { authService } from './auth';

export type OrderType = 'market' | 'limit';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'open' | 'filled' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  pair: string;
  type: OrderType;
  side: OrderSide;
  price?: number;
  amount: number;
  filled: number;
  status: OrderStatus;
  timestamp: number;
}

export interface OrderBook {
  bids: Array<[number, number]>; // [price, amount]
  asks: Array<[number, number]>;
}

class TradingService {
  private orders: Order[] = [];
  private orderBooks: Record<string, OrderBook> = {
    'BTC/USDT': { bids: [[40000, 1.5]], asks: [[41000, 2.0]] },
    'ETH/USDT': { bids: [[2800, 10]], asks: [[2850, 15]] },
    'ETH/BTC': { bids: [[0.07, 5]], asks: [[0.071, 8]] }
  };

  constructor() {
    this.loadOrders();
  }

  private async loadOrders() {
    try {
      const savedOrders = await AsyncStorage.getItem('orders');
      if (savedOrders) {
        this.orders = JSON.parse(savedOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  private async saveOrders() {
    try {
      await AsyncStorage.setItem('orders', JSON.stringify(this.orders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }

  async placeOrder(orderData: Omit<Order, 'id' | 'userId' | 'filled' | 'status'>): Promise<Order> {
    const user = await authService.getUser();
    if (!user) throw new Error('Not authenticated');

    const order: Order = {
      ...orderData,
      id: Math.random().toString(),
      userId: user.id,
      filled: 0,
      status: 'open'
    };

    this.orders.push(order);
    await this.saveOrders();
    return order;
  }

  async getOrders(userId?: string): Promise<Order[]> {
    return userId ? this.orders.filter(o => o.userId === userId) : this.orders;
  }

  getOrderBook(pair: string): OrderBook {
    return this.orderBooks[pair] || { bids: [], asks: [] };
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    const user = await authService.getUser();
    if (!user) throw new Error('Not authenticated');

    const orderIndex = this.orders.findIndex(o => o.id === orderId && o.userId === user.id);
    if (orderIndex === -1) return false;

    this.orders[orderIndex].status = 'cancelled';
    await this.saveOrders();
    return true;
  }
}

export const tradingService = new TradingService();
