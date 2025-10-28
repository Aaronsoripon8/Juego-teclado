import { io } from 'socket.io-client';

// Canviem 'http://localhost:8080' per '/'
// Això fa que Socket.IO es connecti al mateix domini
// des del qual s'està servint la pàgina.
const socket = io('/', { autoConnect: false });

const communicationManager = {
  
  connect(playerName, roomName) {
    socket.connect();
    socket.on('connect', () => {
      console.log('Connectat al servidor amb ID:', socket.id);
      socket.emit('setPlayerName', { name: playerName, room: roomName });
    });
  },

  getSocketId() {
    return socket.id;
  },

  // --- Funcions per ESCOLTAR esdeveniments del servidor ---
  
  onUpdatePlayerList(callback) {
    socket.on('updatePlayerList', callback);
  },

  // --- NOU: Listeners per a la llista de sales ---
  onCurrentRooms(callback) {
    socket.on('currentRooms', callback);
  },

  onUpdateRoomList(callback) { // Ja existia, però ara sabem que rep la llista de sales
    socket.on('updateRoomList', callback);
  },
  // --- Fi de nous listeners ---

  disconnect() {
    socket.disconnect();
  },
  
  removeListener(eventName) {
    socket.off(eventName);
  }
};

export default communicationManager;
