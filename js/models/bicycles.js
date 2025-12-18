/**
 * Bicycles - Modelos 3D de bicicletas con ciclistas
 */
import * as THREE from 'three';

export class BicycleFactory {
    constructor() {
        this.colors = [0x22c55e, 0x3b82f6, 0xf59e0b, 0xef4444, 0x8b5cf6, 0x06b6d4];
        this.clothesColors = [0x1e3a8a, 0x991b1b, 0x065f46, 0x7c2d12, 0x4c1d95, 0x1f2937];
    }

    create(color = null) {
        const group = new THREE.Group();
        const bikeColor = color || this.colors[Math.floor(Math.random() * this.colors.length)];
        const clothesColor = this.clothesColors[Math.floor(Math.random() * this.clothesColors.length)];

        const frameMat = new THREE.MeshStandardMaterial({
            color: bikeColor,
            metalness: 0.6,
            roughness: 0.4
        });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });

        // Rueda trasera
        const rearWheel = this.createWheel(wheelMat, chromeMat);
        rearWheel.position.set(0, 0.4, -0.6);
        group.add(rearWheel);

        // Rueda delantera
        const frontWheel = this.createWheel(wheelMat, chromeMat);
        frontWheel.position.set(0, 0.4, 0.6);
        group.add(frontWheel);

        // Cuadro (frame)
        // Tubo principal
        const mainTube = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8),
            frameMat
        );
        mainTube.position.set(0, 0.6, 0);
        mainTube.rotation.x = Math.PI / 6;
        group.add(mainTube);

        // Tubo del asiento
        const seatTube = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8),
            frameMat
        );
        seatTube.position.set(0, 0.75, -0.3);
        group.add(seatTube);

        // Tubo horizontal superior
        const topTube = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8),
            frameMat
        );
        topTube.rotation.x = Math.PI / 2;
        topTube.position.set(0, 0.85, 0);
        group.add(topTube);

        // Asiento
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.05, 0.25),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
        );
        seat.position.set(0, 1.02, -0.35);
        group.add(seat);

        // Manubrio
        const handlebar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8),
            chromeMat
        );
        handlebar.rotation.z = Math.PI / 2;
        handlebar.position.set(0, 0.95, 0.55);
        group.add(handlebar);

        // Poste del manubrio
        const handlePost = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
            chromeMat
        );
        handlePost.position.set(0, 0.8, 0.55);
        group.add(handlePost);

        // Pedales
        const pedalCrank = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8),
            chromeMat
        );
        pedalCrank.rotation.z = Math.PI / 2;
        pedalCrank.position.set(0, 0.35, -0.15);
        group.add(pedalCrank);

        // Agregar ciclista
        this.addCyclist(group, clothesColor);

        return group;
    }

    createWheel(wheelMat, chromeMat) {
        const wheelGroup = new THREE.Group();

        // Llanta
        const tire = new THREE.Mesh(
            new THREE.TorusGeometry(0.35, 0.06, 8, 24),
            wheelMat
        );
        tire.rotation.y = Math.PI / 2;
        wheelGroup.add(tire);

        // Centro
        const hub = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8),
            chromeMat
        );
        hub.rotation.z = Math.PI / 2;
        wheelGroup.add(hub);

        // Radios (simplificados)
        for (let i = 0; i < 8; i++) {
            const spoke = new THREE.Mesh(
                new THREE.CylinderGeometry(0.005, 0.005, 0.3, 4),
                chromeMat
            );
            spoke.rotation.z = Math.PI / 2;
            spoke.rotation.x = (i / 8) * Math.PI * 2;
            wheelGroup.add(spoke);
        }

        return wheelGroup;
    }

    addCyclist(group, clothesColor) {
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.8 });
        const clothesMat = new THREE.MeshStandardMaterial({ color: clothesColor, roughness: 0.8 });
        const helmetMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

        // Torso
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.4, 0.2),
            clothesMat
        );
        torso.position.set(0, 1.25, 0);
        torso.rotation.x = 0.3;
        torso.castShadow = true;
        group.add(torso);

        // Cabeza
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            skinMat
        );
        head.position.set(0, 1.55, 0.15);
        head.castShadow = true;
        group.add(head);

        // Casco
        const helmet = new THREE.Mesh(
            new THREE.SphereGeometry(0.14, 8, 8),
            helmetMat
        );
        helmet.position.set(0, 1.6, 0.12);
        helmet.scale.set(1, 0.8, 1.2);
        group.add(helmet);

        // Brazos
        [-0.18, 0.18].forEach(x => {
            const upperArm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8),
                clothesMat
            );
            upperArm.position.set(x, 1.2, 0.2);
            upperArm.rotation.x = -0.5;
            group.add(upperArm);

            const forearm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8),
                skinMat
            );
            forearm.position.set(x, 1.05, 0.4);
            forearm.rotation.x = -0.8;
            group.add(forearm);
        });

        // Piernas
        [-0.1, 0.1].forEach((x, i) => {
            const thigh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.35, 8),
                clothesMat
            );
            thigh.position.set(x, 0.85, -0.15 + (i * 0.1));
            thigh.rotation.x = i === 0 ? 0.5 : -0.3;
            group.add(thigh);

            const shin = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8),
                clothesMat
            );
            shin.position.set(x, 0.55, -0.2 + (i * 0.15));
            shin.rotation.x = i === 0 ? -0.3 : 0.4;
            group.add(shin);
        });
    }
}

export function createBicycle() {
    const factory = new BicycleFactory();
    return factory.create();
}
