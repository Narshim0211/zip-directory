const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

let ioInstance = null;

const initNotificationSocket = (server, allowedOrigins = []) => {
  if (!server || ioInstance) return ioInstance;
  ioInstance = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: allowedOrigins.length ? allowedOrigins : true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      return next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  ioInstance.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    socket.emit('connected', { userId: socket.userId });
    socket.on('disconnect', () => {});
  });

  return ioInstance;
};

const emitNotification = (recipientId, notification) => {
  if (!ioInstance || !recipientId) return;
  ioInstance.to(`user:${recipientId}`).emit('notification', notification);
};

module.exports = { initNotificationSocket, emitNotification };
