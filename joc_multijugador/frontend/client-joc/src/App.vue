<script setup>
import { ref, onMounted } from 'vue';
import GameEngine from './components/GameEngine.vue';
import communicationManager from './services/communicationManager.js';

const vistaActual = ref('salaEspera');
const nomJugador = ref('');
const nomSala = ref('');
const jugadors = ref([]);
const activeRooms = ref([]); // <-- NOU: Llista de sales actives

// --- NOU: Funció per unir-se a una sala existent ---
function joinRoom(roomName) {
  if (nomJugador.value.trim() === '') {
    alert('Per favor, introdueix el teu nom primer.');
    return;
  }
  nomSala.value = roomName;
  connectarAlServidor();
}

function connectarAlServidor() {
  if (nomJugador.value.trim() === '') {
    alert('Per favor, introdueix el teu nom.');
    return;
  }
  if (nomSala.value.trim() === '') {
    alert("Per favor, introdueix o selecciona un nom de sala.");
    return;
  }
  
  communicationManager.connect(nomJugador.value, nomSala.value);
  vistaActual.value = 'lobby';
}

onMounted(() => {
  // Escoltem la llista de jugadors
  communicationManager.onUpdatePlayerList((llistaDeJugadors) => {
    jugadors.value = llistaDeJugadors;
  });

  // --- NOU: Escoltem la llista de sales ---
  // Rep la llista quan ens connectem per primer cop
  communicationManager.onCurrentRooms((rooms) => {
    activeRooms.value = rooms;
  });
  // Rep actualitzacions quan algú crea o tanca una sala
  communicationManager.onUpdateRoomList((rooms) => {
    activeRooms.value = rooms;
  });
});
</script>

<template>
  <main class="app-container">
    <header>
      <h1 class="main-title">
        <span>Velo</span><span class="title-accent">Type</span> 🕹️
      </h1>
    </header>

    <Transition name="fade" mode="out-in">
      
      <!-- VISTA 1: SALA D'ESPERA -->
      <div v-if="vistaActual === 'salaEspera'" class="vista-container" key="sala">
        <h2 class="vista-title">Benvingut a la Sala d'Espera</h2>
        
        <div class="form-grup">
          <input 
            type="text" 
            v-model="nomJugador"
            placeholder="El teu nom de jugador" 
            class="input-nom"
          />
        </div>
          
        <!-- --- NOU: Llista de Sales Actives --- -->
        <div class="sala-existent-container">
          <h3 class="vista-subtitle">O uneix-te a una sala existent:</h3>
          <div v-if="activeRooms.length === 0" class="sala-buida">
            No hi ha sales actives. Crea'n una!
          </div>
          <div class="llista-sales">
            <button 
              v-for="room in activeRooms" 
              :key="room" 
              class="btn-sala" 
              @click="joinRoom(room)"
            >
              {{ room }}
            </button>
          </div>
        </div>
        
        <div class="crear-sala-container">
          <h3 class="vista-subtitle">...o crea la teva pròpia sala:</h3>
          <div class="form-grup form-grup-inline">
            <input 
              type="text" 
              v-model="nomSala" 
              placeholder="Nom de la sala (ex: 'Amics')" 
              class="input-nom"
              @keyup.enter="connectarAlServidor"
            />
            <button @click="connectarAlServidor" class="btn-primary btn-crear">
              Entrar
            </button>
          </div>
        </div>
      </div>

      <!-- VISTA 2: LOBBY -->
      <div v-else-if="vistaActual === 'lobby'" class="vista-container" key="lobby">
        <h2 class="vista-title">Lobby Global</h2>
        <p class="vista-subtitle">Sala actual: <span class="sala-actual">{{ nomSala }}</span></p>
        
        <div class="lobby-contingut">
          <h3>Tots els Jugadors Connectats ({{ jugadors.length }})</h3>
          <ul class="llista-jugadors">
            <li v-for="jugador in jugadors" :key="jugador.id">
              {{ jugador.name }}
              <span class="room-label"> (Sala: {{ jugador.room }})</span>
              <span class="tu-label" v-if="jugador.id === communicationManager.getSocketId()"> (Tu)</span>
            </li>
          </ul>
        </div>
        
        <button @click="vistaActual = 'joc'" class="btn-primary btn-començar">
          Comença a Jugar!
        </button>
      </div>

      <!-- VISTA 3: JOC -->
      <div v-else-if="vistaActual === 'joc'" class="vista-container" key="joc">
        <GameEngine />
        <button @click="vistaActual = 'lobby'" class="btn-secondary">
          Tornar al Lobby
        </button>
      </div>
      
    </Transition>
  </main>
</template>

<style scoped>
/* Transició de fosa entre vistes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Contenidor principal */
.app-container {
  width: 100%;
  max-width: 900px;
  padding: 1rem 2rem;
  text-align: center;
}

.main-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #f0f0f0;
  margin-bottom: 2rem;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3),
               0 0 10px rgba(66, 184, 131, 0.3);
}
.title-accent {
  color: #42b883;
}

/* --- Estils per a les Noves Vistes --- */
.vista-container {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.vista-title {
  font-size: 2rem;
  font-weight: 600;
  color: #fff;
}
.vista-subtitle {
  font-size: 1.1rem;
  color: #aaa;
  margin-top: 0rem;
  margin-bottom: -0.5rem;
}
.sala-actual {
  color: #f0f0f0;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.form-grup {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 350px;
  margin-top: 1rem;
}

.input-nom {
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  font-family: 'Poppins', sans-serif;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  border: 1px solid #555;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;
}
.input-nom:focus {
  border-color: #42b883;
  box-shadow: 0 0 15px rgba(66, 184, 131, 0.3);
}

/* --- NOU: Estils Llista de Sales --- */
.sala-existent-container {
  width: 100%;
  max-width: 450px;
  border-top: 1px solid #333;
  padding-top: 1.5rem;
  margin-top: 1rem;
}
.sala-buida {
  color: #777;
  font-style: italic;
  margin-top: 1rem;
}
.llista-sales {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
  max-height: 150px;
  overflow-y: auto;
  padding: 5px;
}
.btn-sala {
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 1.25rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;
  border: 1px solid #555;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-sala:hover {
  background-color: #42b883;
  color: #1a1a1a;
  border-color: #42b883;
  transform: translateY(-2px);
}
.crear-sala-container {
  width: 100%;
  max-width: 450px;
  border-top: 1px solid #333;
  padding-top: 1.5rem;
}
.form-grup-inline {
  flex-direction: row;
  max-width: 450px;
  gap: 0.75rem;
}
.form-grup-inline .input-nom {
  flex-grow: 1; /* L'input ocupa l'espai sobrant */
  text-align: left;
  padding-left: 1.2rem;
}
.btn-crear {
  flex-shrink: 0; /* Evita que el botó s'encongeixi */
  padding: 1rem 1.5rem;
}
/* --- Fi Estils Llista de Sales --- */

/* Botons */
.btn-primary {
  font-size: 1.2rem;
  font-weight: 600;
  padding: 1rem 2rem;
  background-color: #42b883;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.2);
}
.btn-primary:hover {
  background-color: #50dd9a;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 184, 131, 0.3);
}

.btn-secondary {
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: #aaa;
  border: 1px solid #555;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1.5rem;
}
.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: #777;
}

.btn-començar {
  margin-top: 1rem;
  background-color: #3498db;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.2);
}
.btn-començar:hover {
  background-color: #5dade2;
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
}

/* Llista de jugadors */
.lobby-contingut {
  width: 100%;
  max-width: 450px;
  text-align: left;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  padding: 1.5rem 0;
}
.lobby-contingut h3 {
  text-align: center;
  margin-bottom: 1rem;
  color: #ccc;
  font-weight: 500;
}
.llista-jugadors {
  list-style: none;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
}
.llista-jugadors li {
  font-size: 1.1rem;
  padding: 0.75rem 1.5rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-bottom: 0.5rem;
  color: #f0f0f0;
}
.room-label {
  font-style: italic;
  color: #aaa;
  font-size: 0.9rem;
}
.tu-label {
  font-style: italic;
  color: #42b883;
  font-weight: 600;
}
</style>

