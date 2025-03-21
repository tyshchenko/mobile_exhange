
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useWebSocket() {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io('wss://your-crypto-websocket-server.repl.co', {
      transports: ['websocket'],
      forceNew: true,
      closeOnBeforeunload: false
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return socket;
}
