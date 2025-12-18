/**
 * UI Controls - Con controles de tiempo y spawn
 */

export class UIControls {
    constructor(simulation) {
        this.simulation = simulation;
        this.speedMultiplier = 1;

        // Tiempo de simulación
        this.simulatedTimeSeconds = 2 * 3600; // 2 horas
        this.realTimeSeconds = 30; // 30 segundos
        this.timeFactor = 240;

        this.init();
    }

    init() {
        // Botones de control
        this.btnPlay = document.getElementById('btn-play');
        this.btnPause = document.getElementById('btn-pause');
        this.btnRestart = document.getElementById('btn-restart');

        // Slider de velocidad
        this.speedSlider = document.getElementById('speed-slider');
        this.speedValue = document.getElementById('speed-value');

        // Stats
        this.cycleTime = document.getElementById('cycle-time');
        this.activeAgents = document.getElementById('active-agents');
        this.accidentCount = document.getElementById('accident-count');
        this.timelineProgress = document.getElementById('timeline-progress');
        this.timelineMarker = document.getElementById('timeline-marker');

        // Tiempo - Sidebar izquierdo
        this.simulatedHours = document.getElementById('simulated-hours');
        this.simulatedMinutes = document.getElementById('simulated-minutes');
        this.realMinutes = document.getElementById('real-minutes');
        this.realSeconds = document.getElementById('real-seconds');
        this.timeFactorEl = document.getElementById('time-factor');
        this.btnApplyTime = document.getElementById('btn-apply-time');

        // Progreso de simulación
        this.simulatedElapsed = document.getElementById('simulated-elapsed');
        this.realElapsed = document.getElementById('real-elapsed');
        this.completionPercent = document.getElementById('completion-percent');
        this.simulationProgressBar = document.getElementById('simulation-progress-bar');

        // Spawn sliders
        this.vehicleSpawn = document.getElementById('vehicle-spawn');
        this.bicycleSpawn = document.getElementById('bicycle-spawn');
        this.pedestrianSpawn = document.getElementById('pedestrian-spawn');
        this.vehicleSpawnVal = document.getElementById('vehicle-spawn-val');
        this.bicycleSpawnVal = document.getElementById('bicycle-spawn-val');
        this.pedestrianSpawnVal = document.getElementById('pedestrian-spawn-val');

        // Respect sliders
        this.vehicleRespect = document.getElementById('vehicle-respect');
        this.bicycleRespect = document.getElementById('bicycle-respect');
        this.pedestrianRespect = document.getElementById('pedestrian-respect');
        this.vehicleRespectVal = document.getElementById('vehicle-respect-val');
        this.bicycleRespectVal = document.getElementById('bicycle-respect-val');
        this.pedestrianRespectVal = document.getElementById('pedestrian-respect-val');

        // Agent counts
        this.vehicleCountEl = document.getElementById('vehicle-count');
        this.bicycleCountEl = document.getElementById('bicycle-count');
        this.pedestrianCountEl = document.getElementById('pedestrian-count');

        this.setupEventListeners();
        this.updateTimeFactor();
    }

    setupEventListeners() {
        // Play
        this.btnPlay?.addEventListener('click', () => {
            this.simulation.play();
            this.updateButtonStates(true);
        });

        // Pause
        this.btnPause?.addEventListener('click', () => {
            this.simulation.pause();
            this.updateButtonStates(false);
        });

        // Restart
        this.btnRestart?.addEventListener('click', () => {
            this.simulation.restart();
            this.updateButtonStates(true);
        });

        // Speed slider
        this.speedSlider?.addEventListener('input', (e) => {
            this.speedMultiplier = parseFloat(e.target.value);
            if (this.speedValue) {
                this.speedValue.textContent = `${this.speedMultiplier.toFixed(2)}x`;
            }
            this.simulation.setSpeed(this.speedMultiplier);
        });

        // Time inputs - actualizar factor en tiempo real
        [this.simulatedHours, this.simulatedMinutes, this.realMinutes, this.realSeconds].forEach(input => {
            input?.addEventListener('input', () => this.updateTimeFactor());
        });

        // Apply time button
        this.btnApplyTime?.addEventListener('click', () => this.applyTimeConfig());

        // Spawn sliders
        this.vehicleSpawn?.addEventListener('input', (e) => {
            if (this.vehicleSpawnVal) this.vehicleSpawnVal.textContent = `${e.target.value}%`;
            this.updateSpawnConfig();
        });
        this.bicycleSpawn?.addEventListener('input', (e) => {
            if (this.bicycleSpawnVal) this.bicycleSpawnVal.textContent = `${e.target.value}%`;
            this.updateSpawnConfig();
        });
        this.pedestrianSpawn?.addEventListener('input', (e) => {
            if (this.pedestrianSpawnVal) this.pedestrianSpawnVal.textContent = `${e.target.value}%`;
            this.updateSpawnConfig();
        });

        // Respect sliders
        this.vehicleRespect?.addEventListener('input', (e) => {
            if (this.vehicleRespectVal) this.vehicleRespectVal.textContent = `${e.target.value}%`;
            this.updateRespectConfig();
        });
        this.bicycleRespect?.addEventListener('input', (e) => {
            if (this.bicycleRespectVal) this.bicycleRespectVal.textContent = `${e.target.value}%`;
            this.updateRespectConfig();
        });
        this.pedestrianRespect?.addEventListener('input', (e) => {
            if (this.pedestrianRespectVal) this.pedestrianRespectVal.textContent = `${e.target.value}%`;
            this.updateRespectConfig();
        });
    }

    updateTimeFactor() {
        const hours = parseInt(this.simulatedHours?.value || 2);
        const minutes = parseInt(this.simulatedMinutes?.value || 0);
        this.simulatedTimeSeconds = (hours * 3600) + (minutes * 60);

        const realMin = parseInt(this.realMinutes?.value || 0);
        const realSec = parseInt(this.realSeconds?.value || 30);
        this.realTimeSeconds = (realMin * 60) + realSec;

        if (this.realTimeSeconds > 0) {
            this.timeFactor = this.simulatedTimeSeconds / this.realTimeSeconds;
        } else {
            this.timeFactor = 1;
        }

        if (this.timeFactorEl) {
            this.timeFactorEl.textContent = `${Math.round(this.timeFactor)}x`;
        }
    }

    applyTimeConfig() {
        this.updateTimeFactor();
        this.simulation.setTimeConfig(this.simulatedTimeSeconds, this.realTimeSeconds, this.timeFactor);
        console.log(`Tiempo configurado: Simular ${this.formatTime(this.simulatedTimeSeconds)} en ${this.formatTime(this.realTimeSeconds)} (${Math.round(this.timeFactor)}x)`);
    }

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    }

    updateSpawnConfig() {
        const config = {
            vehicle: parseInt(this.vehicleSpawn?.value || 30),
            bicycle: parseInt(this.bicycleSpawn?.value || 25),
            pedestrian: parseInt(this.pedestrianSpawn?.value || 20)
        };
        this.simulation.setSpawnProbability(config);
    }

    updateRespectConfig() {
        const config = {
            vehicle: parseInt(this.vehicleRespect?.value || 97),
            bicycle: parseInt(this.bicycleRespect?.value || 95),
            pedestrian: parseInt(this.pedestrianRespect?.value || 90)
        };
        this.simulation.setRespectProbability(config);
    }

    updateButtonStates(isPlaying) {
        if (this.btnPlay) this.btnPlay.style.opacity = isPlaying ? '0.5' : '1';
        if (this.btnPause) this.btnPause.style.opacity = isPlaying ? '1' : '0.5';
    }

    update(cycleState, agentStats, timeProgress = null) {
        // Ciclo del semáforo
        if (this.cycleTime) {
            this.cycleTime.textContent = `${cycleState.currentTime.toFixed(1)}s / ${cycleState.cycleDuration}s`;
        }

        // Agentes activos
        if (this.activeAgents) {
            this.activeAgents.textContent = agentStats.total;
        }

        // Accidentes
        if (this.accidentCount) {
            this.accidentCount.textContent = agentStats.accidents;
        }

        // Barra de ciclo
        if (this.timelineProgress) {
            this.timelineProgress.style.width = `${cycleState.progress}%`;
        }
        if (this.timelineMarker) {
            this.timelineMarker.style.left = `${cycleState.progress}%`;
        }

        // Contadores por tipo
        if (this.vehicleCountEl) this.vehicleCountEl.textContent = agentStats.vehicles || 0;
        if (this.bicycleCountEl) this.bicycleCountEl.textContent = agentStats.bicycles || 0;
        if (this.pedestrianCountEl) this.pedestrianCountEl.textContent = agentStats.pedestrians || 0;

        // Progreso de tiempo de simulación
        if (timeProgress) {
            if (this.simulatedElapsed) {
                this.simulatedElapsed.textContent = this.formatTime(timeProgress.simulatedElapsed);
            }
            if (this.realElapsed) {
                this.realElapsed.textContent = this.formatTime(timeProgress.realElapsed);
            }
            if (this.completionPercent) {
                this.completionPercent.textContent = `${Math.round(timeProgress.percent)}%`;
            }
            if (this.simulationProgressBar) {
                this.simulationProgressBar.style.width = `${timeProgress.percent}%`;
            }
        }
    }

    updateAccidentCount(count) {
        if (this.accidentCount) {
            this.accidentCount.textContent = count;
            this.accidentCount.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.accidentCount.style.transform = 'scale(1)';
            }, 300);
        }
    }

    getTimeFactor() {
        return this.timeFactor;
    }
}
