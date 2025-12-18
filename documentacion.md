# 📚 Documentación - Simulación de Semáforo 3D

## 📋 Descripción General

Sistema de simulación 3D de una intersección urbana con semáforos, desarrollado con **Three.js**. Permite simular el flujo de tráfico de vehículos, bicicletas y peatones, con configuración de tiempos, probabilidades de spawn y detección de accidentes.

---

## 🚀 Cómo Ejecutar

```bash
# Navegar a la carpeta del proyecto
cd simulacion-semaforo

# Iniciar servidor local
npx live-server --port=3000

# O simplemente:
npx live-server
```

Abrir en navegador: `http://localhost:3000`

---

## 🎮 Controles de la Interfaz

### ⏱️ Sidebar Izquierdo - Tiempo de Simulación

| Control | Descripción |
|---------|-------------|
| **Tiempo a Simular** | Horas y minutos de tráfico que deseas simular |
| **Duración Real** | Tiempo real (minutos/segundos) en que ocurrirá la simulación |
| **Factor de Velocidad** | Calculado automáticamente (ej: 240x = 240 veces más rápido) |
| **Aplicar Configuración** | Aplica los cambios de tiempo |
| **Barra de Progreso** | Muestra el avance de la simulación |

**Ejemplo**: Simular 2 horas de tráfico en 30 segundos reales = Factor 240x

### 🚦 Panel Derecho - Control de Simulación

| Control | Descripción |
|---------|-------------|
| **▶ Play** | Inicia la simulación |
| **⏸ Pause** | Pausa la simulación |
| **🔄 Restart** | Reinicia desde cero |
| **Velocidad** | Multiplicador de velocidad adicional (0.25x - 4x) |

### 🎲 Probabilidad de Spawn

Cada 2 segundos (simulados), se intenta generar agentes con la probabilidad configurada:

| Tipo | Valor por Defecto |
|------|-------------------|
| Vehículos | 30% |
| Bicicletas | 25% |
| Peatones | 20% |

### 🚥 % Respeto al Semáforo

Probabilidad de que cada tipo de agente respete el semáforo rojo:

| Tipo | Valor por Defecto |
|------|-------------------|
| Vehículos | 97% |
| Bicicletas | 95% |
| Peatones | 90% |

---

## 🏗️ Arquitectura del Sistema

```
simulacion-semaforo/
├── index.html              # Estructura HTML con sidebars
├── styles.css              # Estilos CSS
├── js/
│   ├── main.js             # Punto de entrada principal
│   ├── scene.js            # Configuración de Three.js
│   ├── models/
│   │   ├── intersection.js # Modelo de la intersección
│   │   ├── buildings.js    # Edificios decorativos
│   │   ├── trafficLights.js# Semáforos
│   │   ├── vehicles.js     # Autos y motos
│   │   ├── bicycles.js     # Bicicletas
│   │   └── pedestrians.js  # Peatones
│   ├── simulation/
│   │   ├── spawnManager.js # Sistema de spawn probabilístico
│   │   ├── agentManager.js # Gestión de agentes y colisiones
│   │   ├── trafficCycle.js # Ciclo del semáforo
│   │   └── lottery.js      # (Legacy) Sistema de sorteo
│   └── ui/
│       └── controls.js     # Controles de interfaz
```

---

## 🔧 Componentes Principales

### SpawnManager (`spawnManager.js`)

Sistema de generación continua de agentes basado en probabilidades.

```javascript
// Configurar probabilidad de spawn
spawnManager.setSpawnProbability(vehiculo, bicicleta, peaton);

// Configurar probabilidad de respeto
spawnManager.setRespectProbability(vehiculo, bicicleta, peaton);
```

### AgentManager (`agentManager.js`)

Gestiona todos los agentes activos en la simulación.

**Funcionalidades:**
- Spawn de nuevos agentes
- Movimiento según dirección
- Detección de semáforo
- Detección de colisiones (accidentes)
- Efectos visuales de accidente

### TrafficCycle (`trafficCycle.js`)

Controla el ciclo de 20 segundos del semáforo.

| Fase | Duración | NS (Norte-Sur) | EW (Este-Oeste) |
|------|----------|----------------|-----------------|
| 1 | 0-8s | 🟢 Verde | 🔴 Rojo |
| 2 | 8-10s | 🟡 Amarillo | 🔴 Rojo |
| 3 | 10-18s | 🔴 Rojo | 🟢 Verde |
| 4 | 18-20s | 🔴 Rojo | 🟡 Amarillo |

---

## ⚠️ Sistema de Accidentes

Los accidentes ocurren cuando:
1. Dos agentes están en el **área del cruce** (distancia < 10 unidades del centro)
2. Se mueven en **direcciones perpendiculares** (NS vs EW)
3. La distancia entre ellos es menor al umbral de colisión

**Efectos visuales:**
- Destello rojo
- Esfera de humo
- Señal de advertencia amarilla
- Duración: 5 segundos

---

## 📐 Lógica de Carriles

Los agentes siempre circulan por el **carril derecho** según su dirección:

| Entrada | Dirección | Carril |
|---------|-----------|--------|
| 1 (Este) | → Oeste | Z negativo |
| 2 (Sur) | → Norte | X negativo |
| 3 (Oeste) | → Este | Z positivo |
| 4 (Norte) | → Sur | X positivo |

---

## 🎨 Tecnologías Utilizadas

- **Three.js v0.160.0** - Motor de renderizado 3D
- **OrbitControls** - Navegación de cámara (zoom, rotación)
- **HTML5/CSS3** - Interfaz de usuario
- **JavaScript ES6+** - Lógica de aplicación (módulos)

---

## 📊 Parámetros Configurables

### Velocidades de Agentes

| Tipo | Velocidad Base |
|------|----------------|
| Vehículo | 8 unidades/s |
| Bicicleta | 5 unidades/s |
| Peatón | 2 unidades/s |

### Distancias de Colisión

| Tipo | Distancia |
|------|-----------|
| Vehículo | 4 unidades |
| Bicicleta | 2.5 unidades |
| Peatón | 1.2 unidades |

---

## 🖥️ Interacción 3D

- **Click + Arrastrar**: Rotar cámara
- **Scroll**: Zoom in/out
- **Click derecho + Arrastrar**: Mover cámara (pan)

---

## 📝 Ejemplo de Configuración

Para simular **una hora pico** con mucho tráfico y poco respeto:

1. **Tiempo**: 1 hora simulada en 60 segundos reales
2. **Spawn**: Vehículos 50%, Bicicletas 40%, Peatones 35%
3. **Respeto**: Vehículos 80%, Bicicletas 70%, Peatones 60%

Resultado esperado: Mayor flujo de agentes y más accidentes.

---

## 🔄 Flujo de la Simulación

```
┌─────────────────────────────────────────────────────┐
│                    INICIO                           │
└─────────────────────┬───────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│     Usuario configura tiempo y probabilidades       │
└─────────────────────┬───────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│              Click en PLAY                          │
└─────────────────────┬───────────────────────────────┘
                      ▼
         ┌────────────────────────┐
         │   Loop de Animación    │◄────────────────┐
         └───────────┬────────────┘                 │
                     ▼                              │
         ┌────────────────────────┐                 │
         │  Intenta Spawn (prob)  │                 │
         └───────────┬────────────┘                 │
                     ▼                              │
         ┌────────────────────────┐                 │
         │  Actualiza Semáforo    │                 │
         └───────────┬────────────┘                 │
                     ▼                              │
         ┌────────────────────────┐                 │
         │  Mueve Agentes         │                 │
         └───────────┬────────────┘                 │
                     ▼                              │
         ┌────────────────────────┐                 │
         │  Detecta Colisiones    │                 │
         └───────────┬────────────┘                 │
                     ▼                              │
         ┌────────────────────────┐                 │
         │  Elimina Completados   │                 │
         └───────────┬────────────┘                 │
                     ▼                              │
         ┌────────────────────────┐                 │
         │  Actualiza UI          │                 │
         └───────────┬────────────┘                 │
                     ▼                              │
              ¿Tiempo completo?                     │
                 NO ──────────────────────────────► │
                 │                                  │
                 ▼ SÍ                               │
         ┌────────────────────────┐                 
         │     FIN SIMULACIÓN     │                 
         └────────────────────────┘                 
```

---

## 👨‍💻 Autor

Desarrollado como proyecto de simulación para el curso de **Simulación** - CICLO VIII

---

## 📄 Licencia

Proyecto educativo - Uso libre para fines académicos.
