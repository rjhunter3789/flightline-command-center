  const logger = require('../utils/logger');

  // In-memory storage for now (will be replaced with MongoDB)
  const messages = new Map(); // channelId -> messages[]
  const users = new Map(); // socketId -> user info
  const typing = new Map(); // channelId -> Set of userIds

  class ChatHandlers {
    constructor(io) {
      this.io = io;
    }

    handleConnection(socket) {
      logger.info('Chat client connected:', socket.id);

      socket.on('join_chat', (userData) => {
        this.handleJoinChat(socket, userData);
      });

      socket.on('join_channel', (channelId) => {
        this.handleJoinChannel(socket, channelId);
      });

      socket.on('send_message', (messageData) => {
        this.handleSendMessage(socket, messageData);
      });

      socket.on('typing_start', ({ channelId }) => {
        this.handleTypingStart(socket, channelId);
      });

      socket.on('typing_stop', ({ channelId }) => {
        this.handleTypingStop(socket, channelId);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    }

    handleJoinChat(socket, userData) {
      const user = {
        id: userData.id || `user_${socket.id}`,
        name: userData.name || 'Anonymous',
        role: userData.role || 'sales',
        avatar: userData.avatar,
        socketId: socket.id,
        joinedAt: new Date()
      };

      users.set(socket.id, user);

      const defaultChannels = this.getDefaultChannels(user.role);
      defaultChannels.forEach(channel => {
        socket.join(channel);

        const recentMessages = this.getRecentMessages(channel);
        socket.emit('channel_messages', {
          channelId: channel,
          messages: recentMessages
        });
      });

      socket.emit('chat_joined', {
        user,
        channels: defaultChannels
      });

      this.io.emit('user_online', {
        userId: user.id,
        user
      });
    }

    handleJoinChannel(socket, channelId) {
      const user = users.get(socket.id);
      if (!user) return;

      socket.join(channelId);

      const recentMessages = this.getRecentMessages(channelId);
      socket.emit('channel_messages', {
        channelId,
        messages: recentMessages
      });

      socket.to(channelId).emit('user_joined_channel', {
        channelId,
        user
      });
    }

    handleSendMessage(socket, messageData) {
      const user = users.get(socket.id);
      if (!user) return;

      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId: messageData.channelId,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        userAvatar: user.avatar,
        content: messageData.content,
        timestamp: new Date(),
        type: messageData.type || 'text'
      };

      if (!messages.has(message.channelId)) {
        messages.set(message.channelId, []);
      }
      messages.get(message.channelId).push(message);

      const channelMessages = messages.get(message.channelId);
      if (channelMessages.length > 100) {
        channelMessages.shift();
      }

      this.io.to(message.channelId).emit('new_message', message);

      logger.info('Message sent:', {
        channelId: message.channelId,
        userId: user.id,
        messageId: message.id
      });
    }

    handleTypingStart(socket, channelId) {
      const user = users.get(socket.id);
      if (!user) return;

      if (!typing.has(channelId)) {
        typing.set(channelId, new Set());
      }
      typing.get(channelId).add(user.id);

      socket.to(channelId).emit('typing_users', {
        channelId,
        users: Array.from(typing.get(channelId)).map(userId => {
          const typingUser = Array.from(users.values()).find(u => u.id === userId);
          return typingUser ? { id: userId, name: typingUser.name } : null;
        }).filter(Boolean)
      });
    }

    handleTypingStop(socket, channelId) {
      const user = users.get(socket.id);
      if (!user) return;

      if (typing.has(channelId)) {
        typing.get(channelId).delete(user.id);

        socket.to(channelId).emit('typing_users', {
          channelId,
          users: Array.from(typing.get(channelId)).map(userId => {
            const typingUser = Array.from(users.values()).find(u => u.id === userId);
            return typingUser ? { id: userId, name: typingUser.name } : null;
          }).filter(Boolean)
        });
      }
    }

    handleDisconnect(socket) {
      const user = users.get(socket.id);
      if (!user) return;

      typing.forEach((typingUsers, channelId) => {
        if (typingUsers.has(user.id)) {
          typingUsers.delete(user.id);
          this.io.to(channelId).emit('typing_users', {
            channelId,
            users: Array.from(typingUsers).map(userId => {
              const typingUser = Array.from(users.values()).find(u => u.id === userId);
              return typingUser ? { id: userId, name: typingUser.name } : null;
            }).filter(Boolean)
          });
        }
      });

      users.delete(socket.id);

      this.io.emit('user_offline', {
        userId: user.id
      });

      logger.info('Chat client disconnected:', {
        socketId: socket.id,
        userId: user.id
      });
    }

    getDefaultChannels(role) {
      const channels = ['general'];

      switch(role) {
        case 'owner':
        case 'manager':
          channels.push('management');
          break;
        case 'sales':
          channels.push('sales-floor');
          break;
        case 'finance':
          channels.push('finance');
          break;
        case 'service':
          channels.push('service');
          break;
      }

      return channels;
    }

    getRecentMessages(channelId, limit = 50) {
      const channelMessages = messages.get(channelId) || [];
      return channelMessages.slice(-limit);
    }

    getOnlineUsers() {
      return Array.from(users.values()).map(user => ({
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }));
    }
  }

  module.exports = ChatHandlers;
