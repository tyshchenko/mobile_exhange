
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  address: string;
  balance: {
    BTC: number;
    ETH: number;
    USDT: number;
  };
}

class AuthService {
  private user: User | null = null;

  async login(address: string): Promise<User> {
    // Mock user data
    const user = {
      id: Math.random().toString(),
      address,
      balance: {
        BTC: 0.5,
        ETH: 5,
        USDT: 10000
      }
    };
    await AsyncStorage.setItem('user', JSON.stringify(user));
    this.user = user;
    return user;
  }

  async getUser(): Promise<User | null> {
    if (this.user) return this.user;
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      return this.user;
    }
    return null;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('user');
    this.user = null;
  }
}

export const authService = new AuthService();
