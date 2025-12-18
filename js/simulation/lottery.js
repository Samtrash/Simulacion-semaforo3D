/**
 * Lottery - Sistema de sorteo de agentes con configuración dinámica
 */

export class Lottery {
    constructor() {
        // Distribución de tipos de agentes (configurable)
        this.distribution = {
            vehicle: 6,
            pedestrian: 6,
            bicycle: 8
        };

        // Probabilidad de respetar el semáforo por tipo (configurable)
        this.respectProbability = {
            vehicle: 0.97,
            pedestrian: 0.90,
            bicycle: 0.95
        };

        // Lambda para distribución exponencial
        this.LAMBDA = 1.0;

        // Subtipos de vehículos
        this.vehicleSubtypes = ['car', 'car', 'car', 'car', 'motorcycle', 'motorcycle'];
    }

    /**
     * Configura la distribución de agentes
     */
    setDistribution(vehicle, pedestrian, bicycle) {
        this.distribution.vehicle = vehicle;
        this.distribution.pedestrian = pedestrian;
        this.distribution.bicycle = bicycle;
    }

    /**
     * Configura la probabilidad de respeto por tipo
     */
    setRespectProbability(vehicle, pedestrian, bicycle) {
        this.respectProbability.vehicle = vehicle / 100; // Convertir de % a decimal
        this.respectProbability.pedestrian = pedestrian / 100;
        this.respectProbability.bicycle = bicycle / 100;
    }

    /**
     * Genera los agentes con todos sus atributos sorteados
     */
    generateAgents() {
        const agents = [];

        // Crear array de tipos según distribución
        const types = this.createTypeArray();

        // Mezclar aleatoriamente
        this.shuffle(types);

        // Generar tiempos y atributos
        let cumulativeTime = 0;

        types.forEach((type, index) => {
            const interArrivalTime = this.generateExponentialTime();
            cumulativeTime += interArrivalTime;

            const entry = this.assignEntry(type);

            // Probabilidad de respeto específica por tipo
            const respects = Math.random() < this.respectProbability[type];

            let subtype = null;
            if (type === 'vehicle') {
                subtype = this.vehicleSubtypes[Math.floor(Math.random() * this.vehicleSubtypes.length)];
            }

            agents.push({
                id: index + 1,
                type: type,
                subtype: subtype,
                respects: respects,
                entry: entry,
                arrivalTime: cumulativeTime,
                state: 'waiting',
                model3D: null,
                position: null,
                direction: this.getDirection(entry),
                speed: this.getSpeed(type),
                hasEntered: false,
                hasCrossed: false,
                hasPassedStopLine: false
            });
        });

        agents.sort((a, b) => a.arrivalTime - b.arrivalTime);

        return agents;
    }

    createTypeArray() {
        const types = [];

        for (let i = 0; i < this.distribution.vehicle; i++) {
            types.push('vehicle');
        }
        for (let i = 0; i < this.distribution.pedestrian; i++) {
            types.push('pedestrian');
        }
        for (let i = 0; i < this.distribution.bicycle; i++) {
            types.push('bicycle');
        }

        return types;
    }

    generateExponentialTime() {
        const u = Math.random();
        const safeU = Math.max(u, 0.0001);
        return -Math.log(safeU) / this.LAMBDA;
    }

    assignEntry(type) {
        return Math.floor(Math.random() * 4) + 1;
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

    getSpeed(type) {
        const speeds = {
            vehicle: 8,
            bicycle: 5,
            pedestrian: 2
        };
        return speeds[type];
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    getTotalAgents() {
        return this.distribution.vehicle + this.distribution.pedestrian + this.distribution.bicycle;
    }
}
