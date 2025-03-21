
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('wss://your-crypto-websocket-server.repl.co', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return socket;
}
