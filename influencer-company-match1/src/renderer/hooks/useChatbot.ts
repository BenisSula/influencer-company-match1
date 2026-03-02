import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '../services/api-client';

interface ChatbotMessage {
  id: string;
  content: string;
  senderType: 'user' | 'bot';
  intent?: string;
  createdAt: string;
}

interface UseChatbotReturn {
  sendMessage: (content: string) => Promise<ChatbotMessage | null>;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  messages: ChatbotMessage[];
  isTyping: boolean;
  clearMessages: () => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useChatbot = (): UseChatbotReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const conversationIdRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    const token = apiClient.getToken();
    if (!token) {
      console.error('[Chatbot] No auth token available');
      return;
    }
    
    if (socket?.connected) {
      console.log('[Chatbot] Already connected');
      setIsConnected(true);
      return;
    }

    console.log('[Chatbot] Connecting to:', `${SOCKET_URL}/chatbot`);

    const newSocket = io(`${SOCKET_URL}/chatbot`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('[Chatbot] Connected successfully');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Chatbot] Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Chatbot] Connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('connected', (data) => {
      console.log('[Chatbot] Ready:', data);
      // Ensure connected state is set
      setIsConnected(true);
    });

    newSocket.on('message_received', (data) => {
      console.log('[Chatbot] Message received:', data);
      // Only add bot message - user message already added locally
      setMessages(prev => [
        ...prev,
        {
          id: data.botMessage.id,
          content: data.botMessage.content,
          senderType: 'bot',
          intent: data.botMessage.intent,
          createdAt: data.botMessage.createdAt,
        },
      ]);
      setIsTyping(false);
    });

    newSocket.on('bot_typing', (data) => {
      console.log('[Chatbot] Bot typing:', data.isTyping);
      setIsTyping(data.isTyping);
    });

    newSocket.on('history_loaded', (data) => {
      console.log('[Chatbot] History loaded:', data.messages.length, 'messages');
      setMessages(data.messages);
    });

    newSocket.on('error', (error) => {
      console.error('[Chatbot] Error:', error);
      setIsTyping(false);
      
      // Add error message to chat
      const errorMessage: ChatbotMessage = {
        id: Date.now().toString(),
        content: error.message || 'An error occurred. Please try again.',
        senderType: 'bot',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    });

    setSocket(newSocket);
    
    // Force connection status check after a short delay
    setTimeout(() => {
      if (newSocket.connected) {
        console.log('[Chatbot] Force setting connected state');
        setIsConnected(true);
      }
    }, 1000);
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationIdRef.current = null;
  }, []);

  const sendMessage = useCallback(
    async (content: string): Promise<ChatbotMessage | null> => {
      if (!socket || !isConnected) {
        console.error('Socket not connected');
        return null;
      }

      // Add user message immediately
      const userMessage: ChatbotMessage = {
        id: Date.now().toString(),
        content,
        senderType: 'user',
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      return new Promise((resolve) => {
        socket.emit('send_message', {
          content,
          conversationId: conversationIdRef.current,
        });

        // Listen for response
        const handleResponse = (data: any) => {
          conversationIdRef.current = data.botMessage.conversationId;
          setIsTyping(false);
          resolve(data.botMessage);
          socket.off('message_received', handleResponse);
        };

        socket.on('message_received', handleResponse);

        // Timeout after 30 seconds
        setTimeout(() => {
          setIsTyping(false);
          socket.off('message_received', handleResponse);
          
          // Add error message
          const errorMessage: ChatbotMessage = {
            id: (Date.now() + 1).toString(),
            content: 'Sorry, I took too long to respond. Please try again.',
            senderType: 'bot',
            createdAt: new Date().toISOString(),
          };
          setMessages(prev => [...prev, errorMessage]);
          
          resolve(null);
        }, 30000);
      });
    },
    [socket, isConnected]
  );

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    sendMessage,
    isConnected,
    connect,
    disconnect,
    messages,
    isTyping,
    clearMessages,
  };
};
