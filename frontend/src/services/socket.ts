import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private sessionId: string | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.sessionId = null;
    }
  }

  joinSession(sessionId: string) {
    if (this.socket) {
      this.sessionId = sessionId;
      this.socket.emit('join_session', sessionId);
    }
  }

  leaveSession() {
    if (this.socket && this.sessionId) {
      this.socket.emit('leave_session', this.sessionId);
      this.sessionId = null;
    }
  }

  sendMessage(content: string) {
    if (this.socket && this.sessionId) {
      this.socket.emit('send_message', {
        sessionId: this.sessionId,
        content
      });
    }
  }

  endSession() {
    if (this.socket && this.sessionId) {
      this.socket.emit('end_session', this.sessionId);
      this.sessionId = null;
    }
  }

  onSessionJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('session_joined', callback);
    }
  }

  onNewMessages(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_messages', callback);
    }
  }

  onSessionEnded(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('session_ended', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService(); 