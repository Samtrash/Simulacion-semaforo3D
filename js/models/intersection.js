/**
 * Intersection - Modelo 3D de la intersección de calles
 */
import * as THREE from 'three';

export class Intersection {
    constructor() {
        this.group = new THREE.Group();
        this.LANE_WIDTH = 3.5;     // Ancho de carril estándar
        this.BIKE_LANE_WIDTH = 1.5; // Carril de bicicleta
        this.SIDEWALK_WIDTH = 3;    // Ancho de vereda
        this.ROAD_LENGTH = 60;      // Longitud de las calles

        this.build();
    }

    build() {
        this.createGround();
        this.createRoads();
        this.createSidewalks();
        this.createBikeLanes();
        this.createCrosswalks();
        this.createRoadMarkings();
    }

    createGround() {
        // Suelo base (pasto)
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c4e,
            roughness: 0.9
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        this.group.add(ground);
    }

    createRoads() {
        // Material de asfalto
        const asphaltMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8
        });

        // Ancho total de la calle (2 carriles + 2 carriles bici)
        const totalWidth = (this.LANE_WIDTH * 2) + (this.BIKE_LANE_WIDTH * 2);

        // Calle horizontal
        const hRoadGeo = new THREE.PlaneGeometry(this.ROAD_LENGTH * 2, totalWidth);
        const hRoad = new THREE.Mesh(hRoadGeo, asphaltMaterial);
        hRoad.rotation.x = -Math.PI / 2;
        hRoad.position.y = 0.01;
        hRoad.receiveShadow = true;
        this.group.add(hRoad);

        // Calle vertical
        const vRoadGeo = new THREE.PlaneGeometry(totalWidth, this.ROAD_LENGTH * 2);
        const vRoad = new THREE.Mesh(vRoadGeo, asphaltMaterial);
        vRoad.rotation.x = -Math.PI / 2;
        vRoad.position.y = 0.02;
        vRoad.receiveShadow = true;
        this.group.add(vRoad);
    }

    createSidewalks() {
        const sidewalkMaterial = new THREE.MeshStandardMaterial({
            color: 0xc0c0c0,
            roughness: 0.7
        });

        const totalRoadWidth = (this.LANE_WIDTH * 2) + (this.BIKE_LANE_WIDTH * 2);
        const offset = totalRoadWidth / 2 + this.SIDEWALK_WIDTH / 2;

        // Crear veredas en las 4 esquinas y a lo largo de las calles
        const positions = [
            // Veredas horizontales (arriba y abajo de la calle horizontal)
            { x: -30, z: offset, w: 60 - totalRoadWidth, h: this.SIDEWALK_WIDTH },
            { x: 30, z: offset, w: 60 - totalRoadWidth, h: this.SIDEWALK_WIDTH },
            { x: -30, z: -offset, w: 60 - totalRoadWidth, h: this.SIDEWALK_WIDTH },
            { x: 30, z: -offset, w: 60 - totalRoadWidth, h: this.SIDEWALK_WIDTH },
            // Veredas verticales
            { x: offset, z: -30, w: this.SIDEWALK_WIDTH, h: 60 - totalRoadWidth },
            { x: offset, z: 30, w: this.SIDEWALK_WIDTH, h: 60 - totalRoadWidth },
            { x: -offset, z: -30, w: this.SIDEWALK_WIDTH, h: 60 - totalRoadWidth },
            { x: -offset, z: 30, w: this.SIDEWALK_WIDTH, h: 60 - totalRoadWidth },
        ];

        positions.forEach(pos => {
            const geo = new THREE.BoxGeometry(pos.w, 0.15, pos.h);
            const sidewalk = new THREE.Mesh(geo, sidewalkMaterial);
            sidewalk.position.set(pos.x, 0.075, pos.z);
            sidewalk.receiveShadow = true;
            sidewalk.castShadow = true;
            this.group.add(sidewalk);
        });

        // Esquinas de las veredas
        const cornerSize = this.SIDEWALK_WIDTH;
        const cornerOffset = totalRoadWidth / 2 + cornerSize / 2;
        const corners = [
            { x: cornerOffset, z: cornerOffset },
            { x: -cornerOffset, z: cornerOffset },
            { x: cornerOffset, z: -cornerOffset },
            { x: -cornerOffset, z: -cornerOffset },
        ];

        corners.forEach(pos => {
            const geo = new THREE.BoxGeometry(cornerSize, 0.15, cornerSize);
            const corner = new THREE.Mesh(geo, sidewalkMaterial);
            corner.position.set(pos.x, 0.075, pos.z);
            corner.receiveShadow = true;
            this.group.add(corner);
        });
    }

    createBikeLanes() {
        const bikeMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d8a4e,
            roughness: 0.7
        });

        const totalRoadWidth = (this.LANE_WIDTH * 2) + (this.BIKE_LANE_WIDTH * 2);
        const bikeOffset = this.LANE_WIDTH + this.BIKE_LANE_WIDTH / 2;

        // Carril bici horizontal (ambos lados)
        [-1, 1].forEach(side => {
            const geo = new THREE.PlaneGeometry(this.ROAD_LENGTH * 2, this.BIKE_LANE_WIDTH);
            const lane = new THREE.Mesh(geo, bikeMaterial);
            lane.rotation.x = -Math.PI / 2;
            lane.position.set(0, 0.03, side * bikeOffset);
            lane.receiveShadow = true;
            this.group.add(lane);
        });

        // Carril bici vertical (ambos lados)
        [-1, 1].forEach(side => {
            const geo = new THREE.PlaneGeometry(this.BIKE_LANE_WIDTH, this.ROAD_LENGTH * 2);
            const lane = new THREE.Mesh(geo, bikeMaterial);
            lane.rotation.x = -Math.PI / 2;
            lane.position.set(side * bikeOffset, 0.04, 0);
            lane.receiveShadow = true;
            this.group.add(lane);
        });
    }

    createCrosswalks() {
        const crosswalkMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.3,
            emissive: 0xffffff,
            emissiveIntensity: 0.1
        });

        const stripeWidth = 0.6;
        const stripeLength = this.LANE_WIDTH * 2 + this.BIKE_LANE_WIDTH * 2; // Cruza toda la calle
        const stripeGap = 0.4;
        const numStripes = 10;
        const totalRoadWidth = (this.LANE_WIDTH * 2) + (this.BIKE_LANE_WIDTH * 2);

        // 4 cruces peatonales - posicionados justo antes del cruce
        const crosswalkPositions = [
            { x: totalRoadWidth / 2 + 3, z: 0, rotation: 0, axis: 'x' },    // Derecha
            { x: -totalRoadWidth / 2 - 3, z: 0, rotation: 0, axis: 'x' },   // Izquierda
            { x: 0, z: totalRoadWidth / 2 + 3, rotation: Math.PI / 2, axis: 'z' },  // Arriba
            { x: 0, z: -totalRoadWidth / 2 - 3, rotation: Math.PI / 2, axis: 'z' }, // Abajo
        ];

        crosswalkPositions.forEach(pos => {
            // Crear grupo para el paso de cebra
            const crosswalkGroup = new THREE.Group();

            for (let i = 0; i < numStripes; i++) {
                const geo = new THREE.PlaneGeometry(stripeWidth, stripeLength);
                const stripe = new THREE.Mesh(geo, crosswalkMaterial);
                stripe.rotation.x = -Math.PI / 2;
                stripe.rotation.z = pos.rotation;

                const offset = (i - numStripes / 2 + 0.5) * (stripeWidth + stripeGap);
                if (pos.axis === 'x') {
                    stripe.position.set(pos.x, 0.08, pos.z + offset);
                } else {
                    stripe.position.set(pos.x + offset, 0.08, pos.z);
                }

                this.group.add(stripe);
            }
        });

        // Líneas de detención (stop lines) antes de cada cruce
        const stopLineMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.4
        });

        const stopLinePositions = [
            { x: 9, z: -3.5, w: 0.4, h: 7, rotation: 0 },   // Antes de cruce desde derecha
            { x: -9, z: 3.5, w: 0.4, h: 7, rotation: 0 },   // Antes de cruce desde izquierda
            { x: 3.5, z: 9, w: 7, h: 0.4, rotation: 0 },    // Antes de cruce desde arriba
            { x: -3.5, z: -9, w: 7, h: 0.4, rotation: 0 },  // Antes de cruce desde abajo
        ];

        stopLinePositions.forEach(pos => {
            const geo = new THREE.PlaneGeometry(pos.w, pos.h);
            const line = new THREE.Mesh(geo, stopLineMaterial);
            line.rotation.x = -Math.PI / 2;
            line.position.set(pos.x, 0.07, pos.z);
            this.group.add(line);
        });
    }

    createRoadMarkings() {
        const lineMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            roughness: 0.5
        });
        const whiteMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.5
        });

        // Línea central amarilla (divide direcciones)
        // Horizontal
        const hCenterLine = new THREE.Mesh(
            new THREE.PlaneGeometry(this.ROAD_LENGTH * 2, 0.15),
            lineMaterial
        );
        hCenterLine.rotation.x = -Math.PI / 2;
        hCenterLine.position.y = 0.05;
        this.group.add(hCenterLine);

        // Vertical
        const vCenterLine = new THREE.Mesh(
            new THREE.PlaneGeometry(0.15, this.ROAD_LENGTH * 2),
            lineMaterial
        );
        vCenterLine.rotation.x = -Math.PI / 2;
        vCenterLine.position.y = 0.06;
        this.group.add(vCenterLine);

        // Líneas de separación carril/bici (blancas discontinuas)
        const dashLength = 2;
        const dashGap = 2;
        const laneOffset = this.LANE_WIDTH;

        for (let i = -this.ROAD_LENGTH; i < this.ROAD_LENGTH; i += dashLength + dashGap) {
            // Evitar el cruce
            if (Math.abs(i) < 8) continue;

            // Líneas horizontales
            [-1, 1].forEach(side => {
                const dash = new THREE.Mesh(
                    new THREE.PlaneGeometry(dashLength, 0.1),
                    whiteMaterial
                );
                dash.rotation.x = -Math.PI / 2;
                dash.position.set(i + dashLength / 2, 0.05, side * laneOffset);
                this.group.add(dash);
            });

            // Líneas verticales
            [-1, 1].forEach(side => {
                const dash = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.1, dashLength),
                    whiteMaterial
                );
                dash.rotation.x = -Math.PI / 2;
                dash.position.set(side * laneOffset, 0.06, i + dashLength / 2);
                this.group.add(dash);
            });
        }
    }

    getGroup() {
        return this.group;
    }
}
