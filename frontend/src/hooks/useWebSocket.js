import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useWebSocket = (url = process.env.REACT_APP_WS_URL || 'http://localhost:3001') => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  
  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socketRef.current = newSocket;
    setSocket(newSocket);
    
    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);
  
  return { socket, isConnected };
};