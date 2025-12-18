/**
 * Main.js - Simulación con tiempo configurable y spawn continuo
 */
import * as THREE from 'three';
import { SceneManager } from './scene.js';
import { Intersection } from './models/intersection.js';
import { Buildings } from './models/buildings.js';
import { TrafficLights } from './models/trafficLights.js';
import { AgentManager } from './simulation/agentManager.js';
import { TrafficCycle } from './simulation/trafficCycle.js';
import { UIControls } from './ui/controls.js';
import { createDecorativePedestrians } from './models/pedestrians.js';

class TrafficSimulation {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.clock = new THREE.Clock();
        this.isRunning = false;
        this.speedMultiplier = 1;
        this.elapsedTime = 0;

        // Configuración de tiempo
        this.simulatedTimeTotal = 2 * 3600; // 2 horas por defecto
        this.realTimeTotal = 30; // 30 segundos por defecto
        this.timeFactor = 240;
        this.realTimeElapsed = 0;
        this.simulatedTimeElapsed = 0;

        this.init();
    }

    async init() {
        console.log('Iniciando simulación de semáforo 3D...');

        // Crear escena
        this.sceneManager = new SceneManager(this.container);

        // Crear intersección
        this.intersection = new Intersection();
        this.sceneManager.add(this.intersection.getGroup());

        // Crear edificios
        this.buildings = new Buildings();
        this.sceneManager.add(this.buildings.getGroup());

        // Crear semáforos
        this.trafficLights = new TrafficLights();
        this.sceneManager.add(this.trafficLights.getGroup());

        // Peatones decorativos
        const decorativePedestrians = createDecorativePedestrians(6);
        decorativePedestrians.forEach(ped => {
            this.sceneManager.add(ped);
        });

        // Sistema de ciclo de semáforo
        this.trafficCycle = new TrafficCycle(this.trafficLights);

        // Gestor de agentes
        this.agentManager = new AgentManager(this.sceneManager.scene, this.trafficLights);

        // Controles de UI
        this.uiControls = new UIControls(this);

        // Callback de accidentes
        this.agentManager.setOnAccidentCallback((count) => {
            this.uiControls.updateAccidentCount(count);
        });

        // Iniciar animación
        this.animate();

        console.log('Simulación inicializada');
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        // Actualizar controles de cámara
        this.sceneManager.update();

        if (this.isRunning) {
            // Tiempo real transcurrido (afectado por velocidad de UI)
            const realDelta = deltaTime * this.speedMultiplier;
            this.realTimeElapsed += realDelta;

            // Tiempo simulado (aplicando factor de tiempo)
            const simulatedDelta = realDelta * this.timeFactor;
            this.simulatedTimeElapsed += simulatedDelta;
            this.elapsedTime += simulatedDelta;

            // Actualizar ciclo del semáforo
            const cycleState = this.trafficCycle.update(deltaTime, this.speedMultiplier * this.timeFactor);

            // Actualizar agentes
            this.agentManager.update(this.elapsedTime, deltaTime, this.speedMultiplier * this.timeFactor);

            // Estadísticas
            const agentStats = this.agentManager.getStats();

            // Progreso de tiempo
            const timeProgress = {
                simulatedElapsed: this.simulatedTimeElapsed,
                realElapsed: this.realTimeElapsed,
                percent: Math.min((this.realTimeElapsed / this.realTimeTotal) * 100, 100)
            };

            // Actualizar UI
            this.uiControls.update(cycleState, agentStats, timeProgress);

            // Verificar si terminó
            if (this.realTimeElapsed >= this.realTimeTotal) {
                this.pause();
                console.log(`✅ Simulación completada: ${this.formatTime(this.simulatedTimeElapsed)} simulados en ${this.formatTime(this.realTimeElapsed)} reales`);
            }
        }

        // Renderizar
        this.sceneManager.render();
    }

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    }

    play() {
        this.isRunning = true;
        this.trafficCycle.start();
        console.log('▶ Simulación iniciada');
    }

    pause() {
        this.isRunning = false;
        this.trafficCycle.pause();
        console.log('⏸ Simulación pausada');
    }

    restart() {
        this.elapsedTime = 0;
        this.realTimeElapsed = 0;
        this.simulatedTimeElapsed = 0;
        this.trafficCycle.reset();
        this.agentManager.reset();
        this.isRunning = true;
        this.trafficCycle.start();
        console.log('🔄 Simulación reiniciada');
    }

    setSpeed(multiplier) {
        this.speedMultiplier = multiplier;
    }

    setTimeConfig(simulatedSeconds, realSeconds, factor) {
        this.simulatedTimeTotal = simulatedSeconds;
        this.realTimeTotal = realSeconds;
        this.timeFactor = factor;

        // Reiniciar contadores
        this.realTimeElapsed = 0;
        this.simulatedTimeElapsed = 0;
        this.elapsedTime = 0;

        console.log(`⏱️ Configuración: Simular ${this.formatTime(simulatedSeconds)} en ${this.formatTime(realSeconds)} (${Math.round(factor)}x)`);
    }

    setSpawnProbability(config) {
        this.agentManager.spawnManager.setSpawnProbability(
            config.vehicle,
            config.bicycle,
            config.pedestrian
        );
    }

    setRespectProbability(config) {
        this.agentManager.spawnManager.setRespectProbability(
            config.vehicle,
            config.bicycle,
            config.pedestrian
        );
    }
}

// Iniciar
document.addEventListener('DOMContentLoaded', () => {
    window.simulation = new TrafficSimulation();
});
