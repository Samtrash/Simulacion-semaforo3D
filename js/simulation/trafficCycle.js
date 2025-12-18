/**
 * Traffic Cycle - Controlador del ciclo del semáforo
 */

export class TrafficCycle {
    constructor(trafficLights) {
        this.trafficLights = trafficLights;
        this.cycleDuration = 20; // 20 segundos por ciclo completo
        this.currentTime = 0;
        this.currentCycle = 1;
        this.isRunning = false;

        // Fases del ciclo (en segundos)
        this.phases = [
            { start: 0, end: 8, phase: 0 },    // NS verde (0-8s)
            { start: 8, end: 10, phase: 1 },   // Transición amarillo (8-10s)
            { start: 10, end: 18, phase: 2 },  // EW verde (10-18s)
            { start: 18, end: 20, phase: 3 }   // Transición amarillo (18-20s)
        ];
    }

    /**
     * Comienza o reanuda el ciclo
     */
    start() {
        this.isRunning = true;
    }

    /**
     * Pausa el ciclo
     */
    pause() {
        this.isRunning = false;
    }

    /**
     * Reinicia el ciclo
     */
    reset() {
        this.currentTime = 0;
        this.currentCycle = 1;
        this.updatePhase();
    }

    /**
     * Actualiza el ciclo del semáforo
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     * @param {number} speedMultiplier - Multiplicador de velocidad
     * @returns {object} Estado actual del ciclo
     */
    update(deltaTime, speedMultiplier = 1) {
        if (!this.isRunning) {
            return this.getState();
        }

        // Avanzar tiempo
        this.currentTime += deltaTime * speedMultiplier;

        // Verificar si completó un ciclo
        if (this.currentTime >= this.cycleDuration) {
            this.currentTime = this.currentTime % this.cycleDuration;
            this.currentCycle++;
        }

        // Actualizar fase del semáforo
        this.updatePhase();

        return this.getState();
    }

    /**
     * Actualiza la fase del semáforo según el tiempo actual
     */
    updatePhase() {
        for (const phase of this.phases) {
            if (this.currentTime >= phase.start && this.currentTime < phase.end) {
                if (this.trafficLights.getCurrentPhase() !== phase.phase) {
                    this.trafficLights.updateLights(phase.phase);
                }
                break;
            }
        }
    }

    /**
     * Obtiene el estado actual del ciclo
     */
    getState() {
        return {
            currentTime: this.currentTime,
            cycleDuration: this.cycleDuration,
            progress: (this.currentTime / this.cycleDuration) * 100,
            currentCycle: this.currentCycle,
            isRunning: this.isRunning,
            phase: this.getCurrentPhaseName()
        };
    }

    /**
     * Obtiene el nombre de la fase actual
     */
    getCurrentPhaseName() {
        const phase = this.trafficLights.getCurrentPhase();
        const names = {
            0: 'NS Verde',
            1: 'Transición',
            2: 'EW Verde',
            3: 'Transición'
        };
        return names[phase];
    }

    /**
     * Establece el tiempo directamente (para la barra de tiempo)
     */
    setTime(time) {
        this.currentTime = Math.max(0, Math.min(time, this.cycleDuration));
        this.updatePhase();
    }
}
