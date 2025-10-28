# VeloType 🕹️ - Joc de Tecleig Multijugador

Aquest és un projecte d'un joc de tecleig (typing game) multijugador en temps real, construït amb Vue.js 3, Node.js i Socket.IO.

El projecte es divideix en un **frontend** (client Vue.js) i un **backend** (servidor Node.js), que es comuniquen en temps real per gestionar un lobby de jugadors, sales i, properament, partides multijugador.

## 🌟 Característiques Actuals

* **Frontend Reactiu:** Construït amb **Vue.js 3** (Composition API).
* **Backend en Temps Real:** Servidor **Node.js** + **Express** amb **Socket.IO**.
* **Lobby Multijugador:** Els usuaris poden introduir un nom i veure una llista de tots els jugadors connectats a l'instant.
* **Sistema de Sales (Rooms):**
  * Els usuaris poden veure una llista de sales actives creades per altres jugadors.
  * Poden unir-se a una sala existent o crear-ne una de nova.
* **Motor de Joc (Un Jugador):**
  * Banc de 10 paraules aleatòries per partida.
  * Comptadors de **Temps** i **Errors** en temps real.
  * Lògica de tecleig estricta: no permet avançar si la lletra és incorrecta.
  * Feedback visual instantani (lletres verdes/vermelles, animació de "tremolor").
* **Disseny Professional:** Interfície moderna amb efectes de vidre (glassmorphism), gradients i un teclat visual interactiu.

## 🛠️ Tech Stack

| Àrea | Tecnologia | Propòsit | 
 | ----- | ----- | ----- | 
| **Frontend** | [Vue.js 3](https://vuejs.org/) | Framework principal per a la UI reactiva. | 
|  | [Vite](https://vitejs.dev/) | Eina de construcció i servidor de desenvolupament. | 
|  | [Socket.IO Client](https://socket.io/docs/v4/client-api/) | Per connectar-se al backend en temps real. | 
| **Backend** | [Node.js](https://nodejs.org/) | Entorn d'execució del servidor. | 
|  | [Express](https://expressjs.com/) | Framework per crear el servidor HTTP. | 
|  | [Socket.IO](https://socket.io/) | Per a la comunicació WebSocket (lobby, sales). | 

## 📁 Estructura del Projecte

El projecte està separat en dues parts principals que s'executen de manera independent:



joc_multijugador/
├── backend/
│   ├── servidor.js     # El cervell (servidor Socket.IO)
│   └── package.json    # Dependències del backend
│
└── frontend/
├── client-joc/     # El projecte Vue.js
│   ├── src/
│   │   ├── components/
│   │   │   └── GameEngine.vue  # El component del joc
│   │   ├── services/
│   │   │   └── communicationManager.js # Lògica de Socket.IO
│   │   ├── App.vue     # Component principal (gestiona vistes)
│   │   ├── main.js     # Punt d'entrada de Vue
│   │   └── main.css    # Estils globals
│   └── package.json    # Dependències del frontend
└── ...


## 🚀 Instal·lació i Execució

Per executar aquest projecte, necessites tenir **Node.js** (v18 o superior) instal·lat. Hauràs d'executar el backend i el frontend per separat.

### 1. Backend (Servidor)

Obre un terminal i segueix aquests passos:

```bash
# 1. Navega a la carpeta del backend
cd ruta/cap/a/joc_multijugador/backend

# 2. Instal·la les dependències (només la primera vegada)
npm install

# 3. Executa el servidor
node servidor.js


Si tot va bé, veuràs el missatge: Servidor Socket.IO escoltant al port 8080.
Deixa aquest terminal obert.

2. Frontend (Client Vue)

Obre un segon terminal (deixa el primer executant el backend):

# 1. Navega a la carpeta del client de Vue
# (Assegura't que és la carpeta correcta, ex: 'client-joc')
cd ruta/cap/a/joc_multijugador/frontend/client-joc

# 2. Instal·la les dependències (només la primera vegada)
npm install

# 3. Executa el servidor de desenvolupament de Vite
npm run dev


El terminal et donarà una URL local, normalment http://localhost:5173/.

3. Jugar!

Obre http://localhost:5173/ al teu navegador.

Per provar la funcionalitat multijugador, obre-la en dues o més pestanyes del navegador.

Introdueix un nom i crea una sala a la primera pestanya.

Introdueix un altre nom a la segona pestanya i veuràs la sala que has creat. Uneix-t'hi.

Veuràs com la llista de jugadors al lobby s'actualitza a l'instant.

Fes clic a "Comença a Jugar!" per provar el motor del joc.
