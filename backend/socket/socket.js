let io;

const initSocket = (server) => {
  const socketIo = require("socket.io");

  io = socketIo(server, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_order", (orderId) => {
      socket.join(orderId);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

module.exports = { initSocket, getIO };