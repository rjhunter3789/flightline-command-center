import React, { useState, useRef, useEffect } from 'react';
  import { Send, Users, Hash, AtSign, MoreVertical } from 'lucide-react';
  import './Chat.css';

  const Chat = () => {
    const [messages, setMessages] = useState([
      // Mock messages for demo
      {
        id: 1,
        channel: 'general',
        user: 'John Manager',
        role: 'manager',
        message: 'Good morning team! Let\'s make today count.',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: 2,
        channel: 'general',
        user: 'Sarah Sales',
        role: 'sales',
        message: 'Already have 3 test drives scheduled!',
        timestamp: new Date(Date.now() - 3000000),
      },
      {
        id: 3,
        channel: 'general',
        user: 'Mike Owner',
        role: 'owner',
        message: 'Great work Sarah! Keep the momentum going.',
        timestamp: new Date(Date.now() - 2400000),
      }
    ]);

    const [currentChannel, setCurrentChannel] = useState('general');
    const [newMessage, setNewMessage] = useState('');
    const [channels] = useState([
      { id: 'general', name: 'general', type: 'channel' },
      { id: 'sales', name: 'sales', type: 'channel' },
      { id: 'managers', name: 'managers', type: 'channel' },
      { id: 'service', name: 'service', type: 'channel' }
    ]);
    const [directMessages] = useState([
      { id: 'john', name: 'John Manager', type: 'dm', online: true },
      { id: 'sarah', name: 'Sarah Sales', type: 'dm', online: true },
      { id: 'mike', name: 'Mike Owner', type: 'dm', online: false }
    ]);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
      if (newMessage.trim()) {
        const newMsg = {
          id: messages.length + 1,
          channel: currentChannel,
          user: 'You',
          role: 'user',
          message: newMessage,
          timestamp: new Date()
        };
        setMessages([...messages, newMsg]);
        setNewMessage('');
        inputRef.current?.focus();
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const formatTime = (date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const currentMessages = messages.filter(msg => msg.channel === currentChannel);

    return (
      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="chat-workspace">
            <h3>Flightline Team</h3>
            <span className="workspace-status">● Connected</span>
          </div>

          <div className="channel-section">
            <div className="section-header">
              <span>Channels</span>
            </div>
            {channels.map(channel => (
              <div
                key={channel.id}
                className={`channel-item ${currentChannel === channel.id ? 'active' : ''}`}
                onClick={() => setCurrentChannel(channel.id)}
              >
                <Hash size={16} />
                <span>{channel.name}</span>
              </div>
            ))}
          </div>

          <div className="channel-section">
            <div className="section-header">
              <span>Direct Messages</span>
            </div>
            {directMessages.map(dm => (
              <div
                key={dm.id}
                className={`channel-item dm ${currentChannel === dm.id ? 'active' : ''}`}
                onClick={() => setCurrentChannel(dm.id)}
              >
                <div className={`status-indicator ${dm.online ? 'online' : 'offline'}`} />
                <span>{dm.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-main">
          <div className="chat-header">
            <div className="channel-info">
              <Hash size={20} />
              <h4>{currentChannel}</h4>
            </div>
            <div className="chat-actions">
              <button className="action-btn">
                <Users size={18} />
              </button>
              <button className="action-btn">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          <div className="messages-container">
            {currentMessages.length === 0 ? (
              <div className="empty-channel">
                <p>No messages in #{currentChannel} yet. Start the conversation!</p>
              </div>
            ) : (
              currentMessages.map((msg, index) => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className={`message-user ${msg.role}`}>{msg.user}</span>
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                    </div>
                    <div className="message-text">{msg.message}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder={`Message #${currentChannel}`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!newMessage.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default Chat;
