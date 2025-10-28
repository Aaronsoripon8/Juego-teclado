import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permet connexions des de qualsevol origen (per a desenvolupament)
  }
});

const jugadors = {};
console.log('Servidor Socket.IO escoltant al port 8080');

// --- NOU: Funció per obtenir i enviar les sales actives ---
function broadcastActiveRooms() {
  // Creem un Set (per evitar duplicats) amb els noms de les sales de tots els jugadors
  const activeRooms = [...new Set(Object.values(jugadors).map(p => p.room))];
  io.emit('updateRoomList', activeRooms);
}

// Funció per enviar la llista de jugadors actualitzada a TOTHOM
function broadcastPlayerList() {
  io.emit('updatePlayerList', Object.values(jugadors));
}

// Lògica de connexió de Socket.IO
io.on('connection', (socket) => {
  console.log(`Un usuari s'ha connectat: ${socket.id}`);
  
  // --- NOU: Enviar la llista de sales actuals només al nou usuari ---
  const activeRooms = [...new Set(Object.values(jugadors).map(p => p.room))];
  socket.emit('currentRooms', activeRooms);

  // Quan un usuari es desconnecta
  socket.on('disconnect', () => {
    console.log(`L'usuari ${socket.id} s'ha desconnectat`);
    delete jugadors[socket.id];
    broadcastPlayerList();
    broadcastActiveRooms(); // <-- NOU: Actualitzem la llista de sales
  });

  socket.on('setPlayerName', (data) => {
    jugadors[socket.id] = { 
      id: socket.id, 
      name: data.name, 
      room: data.room
    };
    console.log(`L'usuari ${socket.id} ara es diu: ${data.name} i és a la sala: ${data.room}`);
    broadcastPlayerList();
    broadcastActiveRooms(); // <-- NOU: Actualitzem la llista de sales
  });
});

server.listen(8080);

