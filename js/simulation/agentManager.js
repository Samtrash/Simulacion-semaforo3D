/**
 * Agent Manager - Gestión de agentes con spawn continuo y detección de accidentes
 */
import * as THREE from 'three';
import { createVehicle } from '../models/vehicles.js';
import { createBicycle } from '../models/bicycles.js';
import { createPedestrian } from '../models/pedestrians.js';
import { SpawnManager } from './spawnManager.js';

export class AgentManager {
    constructor(scene, trafficLights) {
        this.scene = scene;
        this.trafficLights = trafficLights;
        this.spawnManager = new SpawnManager();
        this.activeAgents = [];
        this.accidentCount = 0;
        this.accidents = []; // Lista de accidentes activos

        // Configuración de posiciones
        this.LANE_WIDTH = 3.5;
        this.BIKE_LANE_OFFSET = 4.25;
        this.SPAWN_DISTANCE = 40;
        this.CROSSING_THRESHOLD = 15;

        // Configuración de colisiones
        this.COLLISION_DISTANCE = {
            vehicle: 4,
            bicycle: 2.5,
            pedestrian: 1.2
        };

        // Posiciones de spawn
        this.spawnPositions = {
            1: { x: this.SPAWN_DISTANCE, z: 0 },
            2: { x: 0, z: -this.SPAWN_DISTANCE },
            3: { x: -this.SPAWN_DISTANCE, z: 0 },
            4: { x: 0, z: this.SPAWN_DISTANCE }
        };

        // Callback para notificar accidentes
        this.onAccident = null;
    }

    /**
     * Reinicia la simulación
     */
    reset() {
        this.clearAgents();
        this.spawnManager.reset();
        this.accidentCount = 0;
        this.accidents = [];
    }

    clearAgents() {
        this.activeAgents.forEach(agent => {
            if (agent.model3D) {
                this.scene.remove(agent.model3D);
            }
        });

        // Limpiar efectos de accidentes
        this.accidents.forEach(acc => {
            if (acc.effect) {
                this.scene.remove(acc.effect);
            }
        });

        this.activeAgents = [];
        this.accidents = [];
    }

    /**
     * Actualiza la simulación
     */
    update(elapsedTime, deltaTime, speedMultiplier = 1) {
        // Intentar spawn de nuevos agentes
        const newAgents = this.spawnManager.trySpawn(elapsedTime);
        newAgents.forEach(agent => this.spawnAgent(agent));

        // Actualizar movimiento de agentes activos
        this.activeAgents.forEach(agent => {
            if (!agent.isInAccident) {
                this.updateAgentMovement(agent, deltaTime, speedMultiplier);
            }
        });

        // Detectar accidentes
        this.detectAccidents();

        // Actualizar efectos de accidentes
        this.updateAccidentEffects(deltaTime);

        // Eliminar agentes que han cruzado
        this.removeCompletedAgents();

        return this.activeAgents.length;
    }

    spawnAgent(agent) {
        let model;
        switch (agent.type) {
            case 'vehicle':
                model = createVehicle(agent.subtype);
                break;
            case 'bicycle':
                model = createBicycle();
                break;
            case 'pedestrian':
                model = createPedestrian();
                break;
        }

        const spawn = this.getSpawnPosition(agent);
        model.position.set(spawn.x, 0, spawn.z);
        model.rotation.y = this.getRotation(agent.direction);

        agent.model3D = model;
        agent.position = { x: spawn.x, z: spawn.z };
        agent.hasEntered = true;
        agent.state = 'moving';

        this.scene.add(model);
        this.activeAgents.push(agent);
    }

    getSpawnPosition(agent) {
        const base = this.spawnPositions[agent.entry];
        let x = base.x;
        let z = base.z;

        const vehicleLaneOffset = this.LANE_WIDTH / 2;
        const bikeLaneOffset = this.BIKE_LANE_OFFSET;
        const pedestrianOffset = this.LANE_WIDTH * 2 + 4;

        switch (agent.entry) {
            case 1:
                if (agent.type === 'bicycle') z = -bikeLaneOffset;
                else if (agent.type === 'pedestrian') z = -pedestrianOffset;
                else z = -vehicleLaneOffset;
                break;
            case 2:
                if (agent.type === 'bicycle') x = bikeLaneOffset;
                else if (agent.type === 'pedestrian') x = pedestrianOffset;
                else x = vehicleLaneOffset;
                break;
            case 3:
                if (agent.type === 'bicycle') z = bikeLaneOffset;
                else if (agent.type === 'pedestrian') z = pedestrianOffset;
                else z = vehicleLaneOffset;
                break;
            case 4:
                if (agent.type === 'bicycle') x = -bikeLaneOffset;
                else if (agent.type === 'pedestrian') x = -pedestrianOffset;
                else x = -vehicleLaneOffset;
                break;
        }

        return { x, z };
    }

    getRotation(direction) {
        const rotations = {
            'EW': -Math.PI / 2,
            'WE': Math.PI / 2,
            'NS': 0,
            'SN': Math.PI
        };
        return rotations[direction];
    }

    updateAgentMovement(agent, deltaTime, speedMultiplier) {
        if (!agent.model3D || agent.hasCrossed || agent.isInAccident) return;

        const speed = agent.speed * speedMultiplier * deltaTime;
        const distanceToCenter = this.getDistanceToCenter(agent);
        const isApproachingCrossing = distanceToCenter < 12 && distanceToCenter > 8;
        const isInCrossing = distanceToCenter <= 8;

        let shouldStop = false;

        // Verificar semáforo
        if (isApproachingCrossing && !agent.hasPassedStopLine) {
            const isGreen = this.trafficLights.isGreen(agent.direction);

            if (agent.respects) {
                shouldStop = !isGreen;
            } else {
                shouldStop = Math.random() < 0.02 && !isGreen;
            }
        }

        // Verificar colisión con agente adelante (solo fuera del cruce)
        if (!shouldStop && !isInCrossing) {
            shouldStop = this.checkFrontCollision(agent);
        }

        if (isInCrossing && !agent.hasPassedStopLine) {
            agent.hasPassedStopLine = true;
        }

        agent.state = shouldStop ? 'stopped' : 'moving';

        if (!shouldStop) {
            this.moveAgent(agent, speed);
        }
    }

    checkFrontCollision(agent) {
        const myCollisionDist = this.COLLISION_DISTANCE[agent.type];

        for (const other of this.activeAgents) {
            if (other.id === agent.id || other.hasCrossed || other.isInAccident) continue;

            const dx = other.position.x - agent.position.x;
            const dz = other.position.z - agent.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            const otherCollisionDist = this.COLLISION_DISTANCE[other.type];
            const minDistance = myCollisionDist + otherCollisionDist;

            if (distance < minDistance && this.isAgentAhead(agent, other)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Detecta accidentes entre agentes que no respetan el semáforo
     */
    detectAccidents() {
        const crossingAgents = this.activeAgents.filter(a => {
            if (a.isInAccident || a.hasCrossed) return false;
            const dist = this.getDistanceToCenter(a);
            return dist < 10; // Dentro del área del cruce
        });

        for (let i = 0; i < crossingAgents.length; i++) {
            for (let j = i + 1; j < crossingAgents.length; j++) {
                const a1 = crossingAgents[i];
                const a2 = crossingAgents[j];

                // Solo detectar accidentes entre agentes de direcciones perpendiculares
                if (!this.arePerpendicular(a1.direction, a2.direction)) continue;

                const dx = a2.position.x - a1.position.x;
                const dz = a2.position.z - a1.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);

                const minDist = this.COLLISION_DISTANCE[a1.type] + this.COLLISION_DISTANCE[a2.type];

                if (distance < minDist * 0.8) {
                    this.createAccident(a1, a2);
                }
            }
        }
    }

    arePerpendicular(dir1, dir2) {
        const horizontal = ['EW', 'WE'];
        const vertical = ['NS', 'SN'];
        return (horizontal.includes(dir1) && vertical.includes(dir2)) ||
            (vertical.includes(dir1) && horizontal.includes(dir2));
    }

    createAccident(agent1, agent2) {
        // Marcar ambos agentes como accidentados
        agent1.isInAccident = true;
        agent2.isInAccident = true;
        agent1.state = 'accident';
        agent2.state = 'accident';

        // Incrementar contador
        this.accidentCount++;

        // Posición del accidente (punto medio)
        const accidentPos = {
            x: (agent1.position.x + agent2.position.x) / 2,
            z: (agent1.position.z + agent2.position.z) / 2
        };

        // Crear efecto visual
        const effect = this.createAccidentEffect(accidentPos);

        this.accidents.push({
            agents: [agent1.id, agent2.id],
            position: accidentPos,
            effect: effect,
            time: 0,
            duration: 5 // Segundos que dura el efecto
        });

        // Notificar
        if (this.onAccident) {
            this.onAccident(this.accidentCount);
        }

        console.log(`⚠️ ACCIDENTE #${this.accidentCount} entre ${agent1.type} y ${agent2.type}`);
    }

    createAccidentEffect(position) {
        const group = new THREE.Group();

        // Esfera de impacto (destello)
        const flashGeo = new THREE.SphereGeometry(2, 16, 16);
        const flashMat = new THREE.MeshBasicMaterial({
            color: 0xff4444,
            transparent: true,
            opacity: 0.8
        });
        const flash = new THREE.Mesh(flashGeo, flashMat);
        flash.position.y = 1;
        group.add(flash);

        // Humo/polvo
        const smokeGeo = new THREE.SphereGeometry(3, 8, 8);
        const smokeMat = new THREE.MeshBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.5
        });
        const smoke = new THREE.Mesh(smokeGeo, smokeMat);
        smoke.position.y = 2;
        group.add(smoke);

        // Signo de exclamación
        const warningGeo = new THREE.ConeGeometry(0.5, 1.5, 3);
        const warningMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const warning = new THREE.Mesh(warningGeo, warningMat);
        warning.position.y = 5;
        warning.rotation.z = Math.PI;
        group.add(warning);

        group.position.set(position.x, 0, position.z);
        this.scene.add(group);

        return group;
    }

    updateAccidentEffects(deltaTime) {
        this.accidents = this.accidents.filter(acc => {
            acc.time += deltaTime;

            if (acc.effect) {
                // Animar el efecto
                const progress = acc.time / acc.duration;
                const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.3;
                acc.effect.scale.set(scale, scale, scale);

                // Desvanecer
                acc.effect.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity = Math.max(0, 1 - progress);
                    }
                });

                // Rotar advertencia
                if (acc.effect.children[2]) {
                    acc.effect.children[2].rotation.y += deltaTime * 3;
                }
            }

            // Eliminar efecto cuando termine
            if (acc.time >= acc.duration) {
                if (acc.effect) {
                    this.scene.remove(acc.effect);
                }

                // Marcar agentes para eliminación
                acc.agents.forEach(id => {
                    const agent = this.activeAgents.find(a => a.id === id);
                    if (agent) {
                        agent.hasCrossed = true; // Para que se elimine
                    }
                });

                return false;
            }
            return true;
        });
    }

    isAgentAhead(agent, other) {
        const dx = other.position.x - agent.position.x;
        const dz = other.position.z - agent.position.z;

        switch (agent.direction) {
            case 'EW': return dx < 0 && Math.abs(dz) < 2;
            case 'WE': return dx > 0 && Math.abs(dz) < 2;
            case 'NS': return dz > 0 && Math.abs(dx) < 2;
            case 'SN': return dz < 0 && Math.abs(dx) < 2;
            default: return false;
        }
    }

    getDistanceToCenter(agent) {
        return Math.sqrt(agent.position.x ** 2 + agent.position.z ** 2);
    }

    moveAgent(agent, speed) {
        const directions = {
            'EW': { x: -1, z: 0 },
            'WE': { x: 1, z: 0 },
            'NS': { x: 0, z: 1 },
            'SN': { x: 0, z: -1 }
        };

        const dir = directions[agent.direction];
        agent.position.x += dir.x * speed;
        agent.position.z += dir.z * speed;

        agent.model3D.position.x = agent.position.x;
        agent.model3D.position.z = agent.position.z;

        if (Math.abs(agent.position.x) > this.SPAWN_DISTANCE + 10 ||
            Math.abs(agent.position.z) > this.SPAWN_DISTANCE + 10) {
            agent.hasCrossed = true;
            agent.state = 'crossed';
        }
    }

    removeCompletedAgents() {
        const toRemove = this.activeAgents.filter(a => a.hasCrossed);
        toRemove.forEach(agent => {
            if (agent.model3D) {
                this.scene.remove(agent.model3D);
            }
        });
        this.activeAgents = this.activeAgents.filter(a => !a.hasCrossed);
    }

    getStats() {
        const typeCount = { vehicle: 0, bicycle: 0, pedestrian: 0 };
        this.activeAgents.forEach(a => typeCount[a.type]++);

        return {
            total: this.activeAgents.length,
            active: this.activeAgents.filter(a => !a.isInAccident).length,
            vehicles: typeCount.vehicle,
            bicycles: typeCount.bicycle,
            pedestrians: typeCount.pedestrian,
            accidents: this.accidentCount,
            inAccident: this.activeAgents.filter(a => a.isInAccident).length
        };
    }

    setOnAccidentCallback(callback) {
        this.onAccident = callback;
    }
}
