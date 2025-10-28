import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
// Imports per servir fitxers estàtics
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
  }
});

// --- SERVIR EL FRONTEND DE VUE ---
// Trobem la carpeta 'dist' que haurà construït el 'build'
const frontendDistPath = path.join(__dirname, '../frontend/client-joc/dist');
// Servim els fitxers estàtics (CSS, JS, imatges)
app.use(express.static(frontendDistPath));
// --- FI DE SERVIR EL FRONTEND ---


const jugadors = {};
console.log('Servidor Socket.IO escoltant al port 8080 (o el que doni Render)');

function broadcastActiveRooms() {
  const activeRooms = [...new Set(Object.values(jugadors).map(p => p.room))];
  io.emit('updateRoomList', activeRooms);
}

function broadcastPlayerList() {
  io.emit('updatePlayerList', Object.values(jugadors));
}

io.on('connection', (socket) => {
  console.log(`Un usuari s'ha connectat: ${socket.id}`);
  
  const activeRooms = [...new Set(Object.values(jugadors).map(p => p.room))];
  socket.emit('currentRooms', activeRooms);

  socket.on('disconnect', () => {
    console.log(`L'usuari ${socket.id} s'ha desconnectat`);
    delete jugadors[socket.id];
    broadcastPlayerList();
    broadcastActiveRooms();
  });

  socket.on('setPlayerName', (data) => {
    jugadors[socket.id] = { 
      id: socket.id, 
      name: data.name, 
      room: data.room
    };
    console.log(`L'usuari ${socket.id} ara es diu: ${data.name} i és a la sala: ${data.room}`);
    broadcastPlayerList();
    broadcastActiveRooms();
  });
});

// --- SERVIR L'INDEX.HTML ---
// Qualsevol ruta que no sigui la de l'API, serveix l'index.html del frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});
// --- FI DE SERVIR L'INDEX.HTML ---

// Render assignarà el port automàticament, per això fem servir process.env.PORT
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor escoltant al port ${PORT}`);
});

