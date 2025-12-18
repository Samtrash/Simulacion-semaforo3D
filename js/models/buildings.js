/**
 * Buildings - Edificios y decoración urbana
 */
import * as THREE from 'three';

export class Buildings {
    constructor() {
        this.group = new THREE.Group();
        this.build();
    }

    build() {
        this.createBuildings();
        this.createTrees();
        this.createStreetLights();
    }

    createBuildings() {
        const buildingColors = [0x8B4513, 0xCD853F, 0xD2691E, 0xA0522D, 0x6B4423, 0x8B7355];
        const roofColors = [0x654321, 0x8B0000, 0x2F4F4F];

        // Posiciones de edificios en las 4 esquinas
        const buildingPositions = [
            // Esquina superior derecha
            { x: 25, z: 25 }, { x: 35, z: 25 }, { x: 25, z: 35 }, { x: 35, z: 35 },
            // Esquina superior izquierda
            { x: -25, z: 25 }, { x: -35, z: 25 }, { x: -25, z: 35 }, { x: -35, z: 35 },
            // Esquina inferior derecha
            { x: 25, z: -25 }, { x: 35, z: -25 }, { x: 25, z: -35 }, { x: 35, z: -35 },
            // Esquina inferior izquierda
            { x: -25, z: -25 }, { x: -35, z: -25 }, { x: -25, z: -35 }, { x: -35, z: -35 },
        ];

        buildingPositions.forEach((pos, i) => {
            const width = 6 + Math.random() * 4;
            const depth = 6 + Math.random() * 4;
            const height = 8 + Math.random() * 12;

            // Cuerpo del edificio
            const buildingGeo = new THREE.BoxGeometry(width, height, depth);
            const buildingMat = new THREE.MeshStandardMaterial({
                color: buildingColors[i % buildingColors.length],
                roughness: 0.8
            });
            const building = new THREE.Mesh(buildingGeo, buildingMat);
            building.position.set(pos.x, height / 2, pos.z);
            building.castShadow = true;
            building.receiveShadow = true;
            this.group.add(building);

            // Techo
            const roofGeo = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, 3, 4);
            const roofMat = new THREE.MeshStandardMaterial({
                color: roofColors[i % roofColors.length],
                roughness: 0.7
            });
            const roof = new THREE.Mesh(roofGeo, roofMat);
            roof.position.set(pos.x, height + 1.5, pos.z);
            roof.rotation.y = Math.PI / 4;
            roof.castShadow = true;
            this.group.add(roof);

            // Ventanas
            this.addWindows(building, width, height, depth, pos);
        });
    }

    addWindows(building, width, height, depth, pos) {
        const windowMat = new THREE.MeshStandardMaterial({
            color: 0x87CEEB,
            roughness: 0.1,
            metalness: 0.3
        });

        const windowWidth = 1;
        const windowHeight = 1.5;
        const floors = Math.floor(height / 3);

        // Ventanas en frentes
        for (let floor = 0; floor < floors; floor++) {
            const y = floor * 3 + 2;

            // Frente y atrás
            [-1, 1].forEach(side => {
                for (let w = -1; w <= 1; w++) {
                    if (Math.random() > 0.2) {
                        const windowGeo = new THREE.PlaneGeometry(windowWidth, windowHeight);
                        const window = new THREE.Mesh(windowGeo, windowMat);
                        window.position.set(
                            pos.x + w * 1.8,
                            y,
                            pos.z + side * (depth / 2 + 0.01)
                        );
                        if (side < 0) window.rotation.y = Math.PI;
                        this.group.add(window);
                    }
                }
            });
        }
    }

    createTrees() {
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 });

        // Posiciones de árboles en las veredas
        const treePositions = [
            { x: 15, z: 12 }, { x: 15, z: -12 },
            { x: -15, z: 12 }, { x: -15, z: -12 },
            { x: 12, z: 15 }, { x: -12, z: 15 },
            { x: 12, z: -15 }, { x: -12, z: -15 },
            { x: 20, z: 15 }, { x: -20, z: 15 },
            { x: 20, z: -15 }, { x: -20, z: -15 },
        ];

        treePositions.forEach(pos => {
            // Tronco
            const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.set(pos.x, 1.5, pos.z);
            trunk.castShadow = true;
            this.group.add(trunk);

            // Copa del árbol
            const leavesGeo = new THREE.SphereGeometry(2, 8, 8);
            const leaves = new THREE.Mesh(leavesGeo, leavesMat);
            leaves.position.set(pos.x, 4.5, pos.z);
            leaves.castShadow = true;
            this.group.add(leaves);
        });
    }

    createStreetLights() {
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
        const lightMat = new THREE.MeshStandardMaterial({
            color: 0xffffcc,
            emissive: 0xffffcc,
            emissiveIntensity: 0.3
        });

        const lightPositions = [
            { x: 10, z: 10 }, { x: -10, z: 10 },
            { x: 10, z: -10 }, { x: -10, z: -10 },
        ];

        lightPositions.forEach(pos => {
            // Poste
            const poleGeo = new THREE.CylinderGeometry(0.15, 0.2, 6, 8);
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.set(pos.x, 3, pos.z);
            pole.castShadow = true;
            this.group.add(pole);

            // Brazo
            const armGeo = new THREE.BoxGeometry(2, 0.1, 0.1);
            const arm = new THREE.Mesh(armGeo, poleMat);
            arm.position.set(pos.x + 1, 6, pos.z);
            this.group.add(arm);

            // Lámpara
            const lampGeo = new THREE.SphereGeometry(0.4, 8, 8);
            const lamp = new THREE.Mesh(lampGeo, lightMat);
            lamp.position.set(pos.x + 2, 5.8, pos.z);
            this.group.add(lamp);
        });
    }

    getGroup() {
        return this.group;
    }
}
