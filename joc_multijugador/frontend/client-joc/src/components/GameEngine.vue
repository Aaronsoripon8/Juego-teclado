<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

// --- BANC DE PARAULES ---
const BANC_DE_PARAULES = [
  'vue', 'react', 'angular', 'javascript', 'typescript', 'component', 'directiva',
  'template', 'props', 'computed', 'watch', 'ref', 'reactive', 'pinia', 'store',
  'router', 'build', 'vite', 'node', 'express', 'socket', 'await', 'async',
  'promise', 'fetch', 'axios', 'tailwind', 'css', 'html', 'flexbox', 'grid',
  'array', 'objecte', 'funcio', 'variable', 'constant', 'bucle', 'condicional'
];

function barrejarArray(array) {
  let arrayBarrejat = [...array];
  for (let i = arrayBarrejat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayBarrejat[i], arrayBarrejat[j]] = [arrayBarrejat[j], arrayBarrejat[i]];
  }
  return arrayBarrejat;
}

const crearEstatInicial = () => {
  const paraulesAleatories = barrejarArray(BANC_DE_PARAULES).slice(0, 10);
  const paraulesDelJoc = paraulesAleatories.map((paraula, index) => ({
    id: index + 1,
    text: paraula,
    estat: 'pendent',
    // Ja no fem servir 'errors' per paraula, però el mantenim per si es volgués
    errors: 0, 
  }));

  return {
    paraules: paraulesDelJoc,
    indexParaulaActiva: 0,
    textEntrat: '',
    estadistiques: [],
  };
};

const estatDelJoc = ref(crearEstatInicial());
const estatPartida = ref('jugant');
let tempsIniciParaula = 0;
const gameInputRef = ref(null);
const isShaking = ref(false);
const tempsTranscorregut = ref(0);
let cronometreGlobal = null;
let tempsIniciPartida = 0;

// --- NOU: Comptador d'errors general ---
const errorsTotals = ref(0);
// --- NOU: Estat per a la lletra incorrecta ---
const lletraActivaIncorrecta = ref(false);

const paraulaActiva = computed(() => {
  if (estatPartida.value === 'jugant' && estatDelJoc.value.indexParaulaActiva < estatDelJoc.value.paraules.length) {
    return estatDelJoc.value.paraules[estatDelJoc.value.indexParaulaActiva];
  }
  return null;
});

function iniciarCronometreParaula() {
  tempsIniciParaula = Date.now();
}

function activarErrorShake() {
  isShaking.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 400);
}

// --- LÒGICA DE TECLEIG REESCRITA (Pas 3) ---
function handleGameKeydown(event) {
  // 1. Gestionar tecles especials (Esborrar)
  if (event.key === 'Backspace') {
    event.preventDefault();
    lletraActivaIncorrecta.value = false; // Esborrem l'error visual
    if (estatDelJoc.value.textEntrat.length > 0) {
      estatDelJoc.value.textEntrat = estatDelJoc.value.textEntrat.slice(0, -1);
    }
    return;
  }

  // 2. Ignorar altres tecles especials
  if (event.key.length > 1 || event.metaKey || event.ctrlKey) {
    return;
  }

  // 3. Aturem l'esdeveniment per defecte
  event.preventDefault();

  // 4. Comprovar si el joc està actiu
  if (estatPartida.value !== 'jugant' || !paraulaActiva.value) return;

  const lletraPremuda = event.key;
  const paraulaText = paraulaActiva.value.text;
  const longEntrada = estatDelJoc.value.textEntrat.length;

  // 5. Si ja hem acabat la paraula, no fem res
  if (longEntrada >= paraulaText.length) {
    return;
  }
  
  // 6. Agafem la lletra que tocaria escriure
  const lletraCorrecta = paraulaText[longEntrada];

  // 7. Comprovem si és la lletra correcta
  if (lletraPremuda === lletraCorrecta) {
    // És CORRECTA!
    
    // Iniciem cronòmetres
    if (longEntrada === 0 && tempsIniciParaula === 0) {
      iniciarCronometreParaula();
    }
    if (estatDelJoc.value.indexParaulaActiva === 0 && longEntrada === 0 && !cronometreGlobal) {
      tempsIniciPartida = Date.now();
      cronometreGlobal = setInterval(() => {
        tempsTranscorregut.value = Math.floor((Date.now() - tempsIniciPartida) / 1000);
      }, 1000);
    }

    // Avancem l'estat
    lletraActivaIncorrecta.value = false; // Netegem qualsevol error visual
    estatDelJoc.value.textEntrat += lletraPremuda;

    // 8. Comprovem si hem acabat la paraula
    if (estatDelJoc.value.textEntrat === paraulaText) {
      const tempsTrigat = Date.now() - tempsIniciParaula;
      // Guardem estadístiques (ara sense errors per paraula, tot és global)
      estatDelJoc.value.estadistiques.push({
        paraula: paraulaText,
        temps: tempsTrigat,
      });
      paraulaActiva.value.estat = 'completada';
      estatDelJoc.value.indexParaulaActiva++;
      estatDelJoc.value.textEntrat = '';
      tempsIniciParaula = 0;
      lletraActivaIncorrecta.value = false; // Assegurem que no hi ha error visual

      // Comprovem si hem acabat el joc
      if (estatDelJoc.value.indexParaulaActiva >= estatDelJoc.value.paraules.length) {
        estatPartida.value = 'acabat';
        clearInterval(cronometreGlobal);
        cronometreGlobal = null;
      }
    }
  } else {
    // ÉS INCORRECTA!
    errorsTotals.value++; // <-- NOU: Sumem a l'error general
    lletraActivaIncorrecta.value = true; // <-- NOU: Marquem que la lletra activa és incorrecta
    activarErrorShake();
    // No fem res més, no avancem el textEntrat
  }
}
// --- FI DE LA LÒGICA DE TECLEIG ---

function getClasseLletra(indexLletra, lletra) {
  const textEntrat = estatDelJoc.value.textEntrat;
  const longEntrada = textEntrat.length;

  // --- NOU: Comprovació d'error actiu ---
  // Si és la lletra on estem ara, i està marcada com a incorrecta
  if (indexLletra === longEntrada && lletraActivaIncorrecta.value) {
    return 'lletra-incorrecta-activa';
  }
  
  // Si la lletra ja s'ha escrit (i per tant, és correcta)
  if (indexLletra < longEntrada) {
    return 'lletra-correcta';
  }
  
  // Si la lletra encara no s'ha tocat
  return 'lletra-pendent';
}


const filesDelTeclat = ref([
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]);
const teclaPremuda = ref('');

function handleGlobalKeydown(event) {
  if (gameInputRef.value && document.activeElement !== gameInputRef.value) {
    gameInputRef.value.focus();
  }
  
  if (event.key.length > 1) return;
  const tecla = event.key.toUpperCase();
  teclaPremuda.value = tecla;
  setTimeout(() => {
    teclaPremuda.value = '';
  }, 120);
}

onMounted(() => {
  window.addEventListener('keyup', handleGlobalKeydown);
  if (gameInputRef.value) {
    gameInputRef.value.focus();
  }
});

onUnmounted(() => {
  window.removeEventListener('keyup', handleGlobalKeydown);
  clearInterval(cronometreGlobal);
});

const totalTemps = computed(() => {
  return estatDelJoc.value.estadistiques.reduce((acc, curr) => acc + curr.temps, 0);
});
// (Ja no necessitem totalErrors computat, fem servir errorsTotals directament)

function reiniciarJoc() {
  clearInterval(cronometreGlobal);
  cronometreGlobal = null;
  tempsTranscorregut.value = 0;
  tempsIniciPartida = 0;
  lletraActivaIncorrecta.value = false;
  errorsTotals.value = 0; // <-- NOU: Reiniciem el comptador general
  
  estatDelJoc.value = crearEstatInicial();
  tempsIniciParaula = 0;
  estatPartida.value = 'jugant';
  
  nextTick(() => {
    if (gameInputRef.value) {
      gameInputRef.value.focus();
    }
  });
}
</script>

<template>
  <div class="game-engine">
    <Transition name="fade" mode="out-in">
      <div v-if="estatPartida === 'jugant'" class="joc-actiu" key="jugant">
        
        <div class="live-stats-container">
          <div class="stat-item">
            <span class="stat-label">Temps</span>
            <span class="stat-value">{{ tempsTranscorregut }}s</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Errors</span>
            <!-- NOU: Mostrem el comptador general -->
            <span class="stat-value error">{{ errorsTotals }}</span>
          </div>
        </div>
        
        <div 
          class="paraules-container"
          :class="{ 'error-shake': isShaking }"
        >
          <div
            v-for="(paraula, index) in estatDelJoc.paraules"
            :key="paraula.id"
            class="paraula"
            :class="{
              'paraula-activa': index === estatDelJoc.indexParaulaActiva,
              'paraula-completada': paraula.estat === 'completada',
            }"
          >
            <template v-if="index === estatDelJoc.indexParaulaActiva">
              <span
                v-for="(lletra, i) in paraula.text.split('')"
                :key="i"
                :class="getClasseLletra(i, lletra)"
              >
                <!-- NOU: Ja no mostrem la lletra incorrecta, només la correcta -->
                {{ lletra }}
              </span>
            </template>
            <template v-else>
              {{ paraula.text }}
            </template>
          </div>
        </div>

        <input
          ref="gameInputRef"
          type="text"
          class="text-input"
          :value="estatDelJoc.textEntrat" 
          @keydown="handleGameKeydown"
          placeholder="Comença a escriure..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </div>

      <div v-else class="resultats-container" key="acabat">
        <h2>🎉 Joc Acabat! 🎉</h2>
        <div class="resultats-metrics">
          <div>
            <span class="metric-label">Temps Total</span>
            <span class="metric-value">{{ tempsTranscorregut }}s</span>
          </div>
          <div>
            <span class="metric-label">Total Errors</span>
            <!-- NOU: Mostrem el comptador general -->
            <span class="metric-value error">{{ errorsTotals }}</span>
          </div>
        </div>
        <button @click="reiniciarJoc" class="btn-reiniciar">
          Tornar a començar
        </button>
      </div>
    </Transition>

    <div class="teclat-container">
      <div
        v-for="(fila, indexFila) in filesDelTeclat"
        :key="indexFila"
        class="fila-teclat"
      >
        <div
          v-for="tecla in fila"
          :key="tecla"
          class="tecla"
          :class="{ 'tecla-premuda': tecla === teclaPremuda }"
        >
          {{ tecla }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transicions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Contenidor principal del joc */
.game-engine {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

.joc-actiu {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Estadístiques en viu */
.live-stats-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}
.stat-label {
  font-size: 0.9rem;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  font-family: 'Fira Code', monospace;
  color: #f0f0f0;
}
.stat-value.error {
  color: #ff3b3b;
}

/* Contenidor de paraules */
.paraules-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  min-height: 120px;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

/* Animació d'error */
.error-shake {
  animation: shake 0.4s ease-in-out;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

/* Paraules individuals */
.paraula {
  font-size: 1.75rem;
  font-family: 'Fira Code', monospace;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: #666;
  transition: all 0.2s ease;
  letter-spacing: 0.5px;
}

.paraula-activa {
  background-color: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;
  font-weight: 500;
}

.paraula-completada {
  color: #00ff9a;
  opacity: 0.7;
}

/* Lletres individuals de la paraula activa */
.paraula-activa span {
  transition: color 0.1s ease, background-color 0.1s ease;
  border-radius: 3px;
  padding: 2px 0;
}
.lletra-correcta {
  color: #00ff9a;
  font-weight: 600;
}
/* NOU: Estil per a la lletra vermella on estem parats */
.lletra-incorrecta-activa {
  color: #ff3b3b; /* Lletra vermella */
  background-color: rgba(255, 59, 59, 0.2); /* Fons vermell */
  font-weight: 600;
}
.lletra-pendent {
  color: #a0a0a0;
}

/* Input de text */
.text-input {
  width: 100%;
  padding: 1rem;
  font-size: 1.75rem;
  font-family: 'Fira Code', monospace;
  text-align: center;
  background-color: transparent;
  color: white; /* El text escrit serà blanc */
  border: none;
  border-bottom: 2px solid #555;
  border-radius: 0;
  outline: none;
  box-sizing: border-box;
  transition: all 0.3s ease;
  caret-color: #42b883; /* Color del cursor (pipe) */
}

.text-input:focus {
  border-bottom-color: #42b883;
  box-shadow: 0 5px 20px -5px rgba(66, 184, 131, 0.3);
}

/* Teclat visual */
.teclat-container {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  user-select: none;
}

.fila-teclat {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.tecla {
  font-family: 'Fira Code', monospace;
  font-weight: 600;
  font-size: 1rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #2e2e2e, #262626);
  color: #e0e0e0;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  box-shadow: 0 4px 0 #111, 0 5px 5px rgba(0, 0, 0, 0.4);
  transition: all 0.1s ease-out;
}

.tecla-premuda,
.tecla:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #111,
              0 0 20px #00ff9a;
  background: #00ff9a;
  color: #111;
}

/* Pantalla de resultats */
.resultats-container {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 12px;
  width: 100%;
}
.resultats-container h2 {
  margin-top: 0;
  color: #00ff9a;
  font-size: 2rem;
}

.resultats-metrics {
  display: flex;
  justify-content: space-around;
  margin: 2rem 0;
}
.resultats-metrics > div {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.metric-label {
  font-size: 1rem;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #f0f0f0;
}
.metric-value.error {
  color: #ff3b3b;
}

.btn-reiniciar {
  font-size: 1.2rem;
  font-weight: 600;
  padding: 1rem 2rem;
  margin-top: 1rem;
  background-color: #42b883;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.2);
}
.btn-reiniciar:hover {
  background-color: #50dd9a;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 184, 131, 0.3);
}
</style>

