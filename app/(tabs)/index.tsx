
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { tradingService, Order } from '@/services/trading';
import { authService, User } from '@/services/auth';
import { useWebSocket } from '@/services/websocket';

export default function HomeScreen() {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [orderType, setOrderType] = useState('limit');
  const [orderSide, setOrderSide] = useState('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const colorScheme = useColorScheme();
  const socket = useWebSocket();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [chartData, setChartData] = useState({
    labels: ['5m', '15m', '30m', '1h', '4h', '1d'],
    datasets: [{
      data: [40000, 41000, 42000, 41500, 42500, 43000],
    }]
  });

  const pairs = ['BTC/USDT', 'ETH/USDT', 'ETH/BTC'];

  useEffect(() => {
    authService.getUser().then(setUser);
    if (user) {
      tradingService.getOrders(user.id).then(setOrders);
    }
  }, [user?.id]);

  useEffect(() => {
    if (socket) {
      socket.on('price_update', (data) => {
        if (data.pair === selectedPair) {
          setChartData(prev => ({
            ...prev,
            datasets: [{
              data: [...prev.datasets[0].data.slice(1), data.price]
            }]
          }));
        }
      });
    }
  }, [socket, selectedPair]);

  const handleOrder = async () => {
    try {
      const order = await tradingService.placeOrder({
        pair: selectedPair,
        type: orderType as any,
        side: orderSide as any,
        price: orderType === 'limit' ? parseFloat(price) : undefined,
        amount: parseFloat(amount),
        timestamp: Date.now()
      });
      setOrders(prev => [...prev, order]);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      await tradingService.cancelOrder(orderId);
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ));
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Please connect your wallet to trade</ThemedText>
        <Pressable
          style={styles.connectButton}
          onPress={() => authService.login('0x123...789')}
        >
          <ThemedText>Connect Wallet</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.pairList} horizontal>
        {pairs.map(pair => (
          <Pressable
            key={pair}
            style={[styles.pairButton, selectedPair === pair && styles.selectedPair]}
            onPress={() => setSelectedPair(pair)}
          >
            <ThemedText>{pair}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.chart}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 16}
          height={220}
          chartConfig={{
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
            backgroundGradientFrom: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
            backgroundGradientTo: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            labelColor: (opacity = 1) =>
              colorScheme === 'dark'
                ? `rgba(255, 255, 255, ${opacity})`
                : `rgba(0, 0, 0, ${opacity})`,
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>

      <View style={styles.orderForm}>
        <ThemedText style={styles.pairTitle}>{selectedPair}</ThemedText>
        
        <View style={styles.orderTypeButtons}>
          <Pressable
            style={[styles.typeButton, orderType === 'limit' && styles.selectedType]}
            onPress={() => setOrderType('limit')}
          >
            <ThemedText>Limit</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.typeButton, orderType === 'market' && styles.selectedType]}
            onPress={() => setOrderType('market')}
          >
            <ThemedText>Market</ThemedText>
          </Pressable>
        </View>

        {orderType === 'limit' && (
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholderTextColor="#666"
        />

        <Pressable
          style={[styles.orderButton, { backgroundColor: orderSide === 'buy' ? '#4CAF50' : '#f44336' }]}
          onPress={handleOrder}
        >
          <ThemedText>{orderSide === 'buy' ? 'Buy' : 'Sell'}</ThemedText>
        </Pressable>
      </View>

      <View style={styles.orders}>
        <ThemedText style={styles.ordersTitle}>Your Orders</ThemedText>
        <ScrollView>
          {orders.map(order => (
            <View key={order.id} style={styles.orderItem}>
              <ThemedText>{order.pair} - {order.type} {order.side}</ThemedText>
              <ThemedText>Amount: {order.amount}</ThemedText>
              {order.status === 'open' && (
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => handleCancel(order.id)}
                >
                  <ThemedText>Cancel</ThemedText>
                </Pressable>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  pairList: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  pairButton: {
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: '#2a2a2a',
  },
  selectedPair: {
    backgroundColor: '#4a4a4a',
  },
  chart: {
    marginVertical: 20,
  },
  orderForm: {
    padding: 15,
  },
  pairTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderTypeButtons: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#2a2a2a',
  },
  selectedType: {
    backgroundColor: '#4a4a4a',
  },
  input: {
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    color: '#ffffff',
  },
  orderButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  orders: {
    flex: 1,
    marginTop: 20,
  },
  ordersTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  orderItem: {
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 5,
    borderRadius: 3,
    alignItems: 'center',
    marginTop: 5,
  },
});
