/**
 * Traffic Lights - Semáforos vehiculares y peatonales
 */
import * as THREE from 'three';

export class TrafficLights {
    constructor() {
        this.group = new THREE.Group();
        this.lights = [];
        this.currentPhase = 0; // 0: NS verde, 1: transición, 2: EW verde, 3: transición

        this.build();
    }

    build() {
        // Semáforos en las 4 esquinas
        const positions = [
            { x: 8, z: 8, rotationY: -Math.PI / 4, direction: 'NS' },
            { x: -8, z: 8, rotationY: Math.PI / 4, direction: 'EW' },
            { x: 8, z: -8, rotationY: -Math.PI * 3 / 4, direction: 'EW' },
            { x: -8, z: -8, rotationY: Math.PI * 3 / 4, direction: 'NS' },
        ];

        positions.forEach(pos => {
            const trafficLight = this.createTrafficLight(pos);
            this.group.add(trafficLight.group);
            this.lights.push(trafficLight);
        });

        // Estado inicial
        this.updateLights(0);
    }

    createTrafficLight(pos) {
        const tlGroup = new THREE.Group();

        // Poste
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 });
        const poleGeo = new THREE.CylinderGeometry(0.15, 0.2, 5, 8);
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 2.5;
        pole.castShadow = true;
        tlGroup.add(pole);

        // Caja del semáforo
        const boxGeo = new THREE.BoxGeometry(0.8, 2.4, 0.5);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.y = 5.5;
        box.castShadow = true;
        tlGroup.add(box);

        // Luces
        const lightRadius = 0.25;
        const lightPositions = [
            { y: 6.2, color: 'red' },
            { y: 5.5, color: 'yellow' },
            { y: 4.8, color: 'green' }
        ];

        const lightMeshes = {};

        lightPositions.forEach(light => {
            const geo = new THREE.CircleGeometry(lightRadius, 16);
            const mat = new THREE.MeshStandardMaterial({
                color: this.getColor(light.color, false),
                emissive: 0x000000,
                emissiveIntensity: 0
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(0, light.y, 0.26);
            tlGroup.add(mesh);
            lightMeshes[light.color] = mesh;
        });

        // Semáforo peatonal
        const pedBox = new THREE.BoxGeometry(0.5, 1.2, 0.4);
        const pedBoxMesh = new THREE.Mesh(pedBox, boxMat);
        pedBoxMesh.position.set(0.6, 4, 0);
        tlGroup.add(pedBoxMesh);

        // Luces peatonales
        const pedLights = {};
        [{ y: 4.3, color: 'pedRed' }, { y: 3.7, color: 'pedGreen' }].forEach(light => {
            const geo = new THREE.CircleGeometry(0.15, 16);
            const mat = new THREE.MeshStandardMaterial({
                color: light.color === 'pedRed' ? 0x330000 : 0x003300,
                emissive: 0x000000
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(0.6, light.y, 0.21);
            tlGroup.add(mesh);
            pedLights[light.color] = mesh;
        });

        tlGroup.position.set(pos.x, 0, pos.z);
        tlGroup.rotation.y = pos.rotationY;

        return {
            group: tlGroup,
            lights: lightMeshes,
            pedLights: pedLights,
            direction: pos.direction
        };
    }

    getColor(colorName, isOn) {
        const colors = {
            red: isOn ? 0xff0000 : 0x330000,
            yellow: isOn ? 0xffff00 : 0x333300,
            green: isOn ? 0x00ff00 : 0x003300
        };
        return colors[colorName];
    }

    updateLights(phase) {
        this.currentPhase = phase;

        this.lights.forEach(tl => {
            const isNS = tl.direction === 'NS';

            // Determinar estado según fase y dirección
            let redOn = false, yellowOn = false, greenOn = false;
            let pedRedOn = true, pedGreenOn = false;

            switch (phase) {
                case 0: // NS verde, EW rojo
                    if (isNS) {
                        greenOn = true;
                        pedGreenOn = true;
                        pedRedOn = false;
                    } else {
                        redOn = true;
                    }
                    break;
                case 1: // Transición NS amarillo
                    if (isNS) {
                        yellowOn = true;
                    } else {
                        redOn = true;
                    }
                    break;
                case 2: // EW verde, NS rojo
                    if (!isNS) {
                        greenOn = true;
                        pedGreenOn = true;
                        pedRedOn = false;
                    } else {
                        redOn = true;
                    }
                    break;
                case 3: // Transición EW amarillo
                    if (!isNS) {
                        yellowOn = true;
                    } else {
                        redOn = true;
                    }
                    break;
            }

            // Aplicar colores
            tl.lights.red.material.color.setHex(this.getColor('red', redOn));
            tl.lights.red.material.emissive.setHex(redOn ? 0xff0000 : 0x000000);
            tl.lights.red.material.emissiveIntensity = redOn ? 1 : 0;

            tl.lights.yellow.material.color.setHex(this.getColor('yellow', yellowOn));
            tl.lights.yellow.material.emissive.setHex(yellowOn ? 0xffff00 : 0x000000);
            tl.lights.yellow.material.emissiveIntensity = yellowOn ? 1 : 0;

            tl.lights.green.material.color.setHex(this.getColor('green', greenOn));
            tl.lights.green.material.emissive.setHex(greenOn ? 0x00ff00 : 0x000000);
            tl.lights.green.material.emissiveIntensity = greenOn ? 1 : 0;

            // Luces peatonales
            tl.pedLights.pedRed.material.color.setHex(pedRedOn ? 0xff0000 : 0x330000);
            tl.pedLights.pedRed.material.emissive.setHex(pedRedOn ? 0xff0000 : 0x000000);
            tl.pedLights.pedRed.material.emissiveIntensity = pedRedOn ? 0.8 : 0;

            tl.pedLights.pedGreen.material.color.setHex(pedGreenOn ? 0x00ff00 : 0x003300);
            tl.pedLights.pedGreen.material.emissive.setHex(pedGreenOn ? 0x00ff00 : 0x000000);
            tl.pedLights.pedGreen.material.emissiveIntensity = pedGreenOn ? 0.8 : 0;
        });
    }

    // Obtener si una dirección tiene luz verde
    isGreen(direction) {
        if (direction === 'NS' || direction === 'SN') {
            return this.currentPhase === 0;
        } else {
            return this.currentPhase === 2;
        }
    }

    isYellow(direction) {
        if (direction === 'NS' || direction === 'SN') {
            return this.currentPhase === 1;
        } else {
            return this.currentPhase === 3;
        }
    }

    getCurrentPhase() {
        return this.currentPhase;
    }

    getGroup() {
        return this.group;
    }
}
