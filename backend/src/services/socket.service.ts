import { Server } from 'socket.io';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
    
    socket.on('joinKitchen', () => {
      socket.join('kitchen');
      console.log('Cliente entrou na cozinha:', socket.id);
    });
  });
};