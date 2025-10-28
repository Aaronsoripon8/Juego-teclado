import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permet connexions des de qualsevol origen (perfecte per local)
  }
});

const jugadors = {};
const PORT = 8080; // Port fix per al desenvolupament local

console.log(`Servidor Socket.IO (local) escoltant al port ${PORT}`);

// Funció per enviar la llista de sales actives actualitzada a TOTHOM
function broadcastActiveRooms() {
  // Filtrem per sales que no estiguin buides (opcional, però bona idea)
  const allRooms = Object.values(jugadors).map(p => p.room);
  const activeRooms = [...new Set(allRooms)];
  io.emit('updateRoomList', activeRooms);
}

// Funció per enviar la llista de jugadors actualitzada a TOTHOM
function broadcastPlayerList() {
  io.emit('updatePlayerList', Object.values(jugadors));
}

// Lògica de connexió de Socket.IO
io.on('connection', (socket) => {
  console.log(`Un usuari s'ha connectat: ${socket.id}`);
  
  // Envia la llista de sales només al client que s'acaba de connectar
  const allRooms = Object.values(jugadors).map(p => p.room);
  const activeRooms = [...new Set(allRooms)];
  socket.emit('currentRooms', activeRooms);

  // Quan un usuari es desconnecta
  socket.on('disconnect', () => {
    console.log(`L'usuari ${socket.id} s'ha desconnectat`);
    // Esborrem el jugador i actualitzem les llistes per a tothom
    delete jugadors[socket.id];
    broadcastPlayerList();
    broadcastActiveRooms(); // Envia la llista de sales per si alguna ha quedat buida
  });

  // Quan un usuari ens envia el seu nom i sala
  socket.on('setPlayerName', (data) => {
    jugadors[socket.id] = { 
      id: socket.id, 
      name: data.name, 
      room: data.room
    };
    console.log(`L'usuari ${socket.id} ara es diu: ${data.name} i és a la sala: ${data.room}`);
    
    // Actualitzem les llistes per a TOTHOM
    broadcastPlayerList();
    broadcastActiveRooms(); // Envia la nova llista de sales si se n'ha creat una
  });
});

server.listen(PORT);

