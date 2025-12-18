/**
 * Spawn Manager - Sistema de spawn probabilístico continuo
 */

export class SpawnManager {
    constructor() {
        // Intervalo base de spawn (segundos simulados)
        this.spawnInterval = 2; // Cada 2 segundos intenta spawnear
        this.lastSpawnTime = 0;
        this.agentIdCounter = 0;

        // Probabilidades de spawn (0-100%)
        this.spawnProbability = {
            vehicle: 30,     // 30% probabilidad cada intervalo
            bicycle: 25,     // 25%
            pedestrian: 20   // 20%
        };

        // Probabilidades de respeto al semáforo (0-100%)
        this.respectProbability = {
            vehicle: 97,
            bicycle: 95,
            pedestrian: 90
        };

        // Subtipos de vehículos
        this.vehicleSubtypes = ['car', 'car', 'car', 'car', 'motorcycle', 'motorcycle'];

        // Velocidades
        this.speeds = {
            vehicle: 8,
            bicycle: 5,
            pedestrian: 2
        };
    }

    /**
     * Configura probabilidad de spawn
     */
    setSpawnProbability(vehicle, bicycle, pedestrian) {
        this.spawnProbability.vehicle = vehicle;
        this.spawnProbability.bicycle = bicycle;
        this.spawnProbability.pedestrian = pedestrian;
    }

    /**
     * Configura probabilidad de respeto
     */
    setRespectProbability(vehicle, bicycle, pedestrian) {
        this.respectProbability.vehicle = vehicle;
        this.respectProbability.bicycle = bicycle;
        this.respectProbability.pedestrian = pedestrian;
    }

    /**
     * Configura intervalo de spawn
     */
    setSpawnInterval(interval) {
        this.spawnInterval = interval;
    }

    /**
     * Intenta generar nuevos agentes basado en probabilidad
     * @returns {Array} Lista de nuevos agentes a crear
     */
    trySpawn(currentTime) {
        const newAgents = [];

        // Verificar si pasó suficiente tiempo desde el último spawn
        if (currentTime - this.lastSpawnTime < this.spawnInterval) {
            return newAgents;
        }

        this.lastSpawnTime = currentTime;

        // Intentar spawn para cada tipo
        const types = ['vehicle', 'bicycle', 'pedestrian'];

        types.forEach(type => {
            // Verificar probabilidad de spawn
            const probability = this.spawnProbability[type] / 100;
            if (Math.random() < probability) {
                const agent = this.createAgent(type);
                newAgents.push(agent);
            }
        });

        return newAgents;
    }

    /**
     * Crea un nuevo agente
     */
    createAgent(type) {
        this.agentIdCounter++;

        const entry = Math.floor(Math.random() * 4) + 1;
        const direction = this.getDirection(entry);
        const respects = Math.random() < (this.respectProbability[type] / 100);

        let subtype = null;
        if (type === 'vehicle') {
            subtype = this.vehicleSubtypes[Math.floor(Math.random() * this.vehicleSubtypes.length)];
        }

        return {
            id: this.agentIdCounter,
            type: type,
            subtype: subtype,
            respects: respects,
            entry: entry,
            direction: direction,
            speed: this.speeds[type],
            state: 'spawning',
            model3D: null,
            position: null,
            hasEntered: false,
            hasCrossed: false,
            hasPassedStopLine: false,
            isInAccident: false
        };
    }

    getDirection(entry) {
        const directions = {
            1: 'EW',
            2: 'NS',
            3: 'WE',
            4: 'SN'
        };
        return directions[entry];
    }

    reset() {
        this.lastSpawnTime = 0;
        this.agentIdCounter = 0;
    }
}
