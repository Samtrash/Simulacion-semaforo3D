/**
 * Vehicles - Modelos 3D de vehículos (autos y motos)
 */
import * as THREE from 'three';

export class VehicleFactory {
    constructor() {
        this.carColors = [0x1a56db, 0xdc2626, 0x16a34a, 0xeab308, 0x7c3aed, 0x0891b2, 0xdb2777];
    }

    createCar(color = null) {
        const group = new THREE.Group();
        const carColor = color || this.carColors[Math.floor(Math.random() * this.carColors.length)];

        const bodyMat = new THREE.MeshStandardMaterial({
            color: carColor,
            metalness: 0.6,
            roughness: 0.4
        });
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x87CEEB,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.7
        });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });

        // Carrocería inferior
        const bodyLower = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.6, 4),
            bodyMat
        );
        bodyLower.position.y = 0.5;
        bodyLower.castShadow = true;
        group.add(bodyLower);

        // Carrocería superior (cabina)
        const bodyUpper = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.7, 2),
            bodyMat
        );
        bodyUpper.position.set(0, 1.15, -0.3);
        bodyUpper.castShadow = true;
        group.add(bodyUpper);

        // Parabrisas frontal
        const windshield = new THREE.Mesh(
            new THREE.PlaneGeometry(1.6, 0.6),
            glassMat
        );
        windshield.position.set(0, 1.1, 0.75);
        windshield.rotation.x = -0.3;
        group.add(windshield);

        // Parabrisas trasero
        const rearWindow = new THREE.Mesh(
            new THREE.PlaneGeometry(1.6, 0.5),
            glassMat
        );
        rearWindow.position.set(0, 1.1, -1.4);
        rearWindow.rotation.x = 0.3;
        group.add(rearWindow);

        // Ruedas
        const wheelPositions = [
            { x: 0.9, z: 1.2 },
            { x: -0.9, z: 1.2 },
            { x: 0.9, z: -1.2 },
            { x: -0.9, z: -1.2 }
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16),
                wheelMat
            );
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.35, pos.z);
            wheel.castShadow = true;
            group.add(wheel);

            // Rin
            const rim = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.2, 0.26, 8),
                rimMat
            );
            rim.rotation.z = Math.PI / 2;
            rim.position.set(pos.x, 0.35, pos.z);
            group.add(rim);
        });

        // Faros
        const headlightMat = new THREE.MeshStandardMaterial({
            color: 0xffffcc,
            emissive: 0xffffcc,
            emissiveIntensity: 0.5
        });
        [-0.6, 0.6].forEach(x => {
            const headlight = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 8, 8),
                headlightMat
            );
            headlight.position.set(x, 0.5, 2);
            group.add(headlight);
        });

        // Luces traseras
        const tailLightMat = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.3
        });
        [-0.7, 0.7].forEach(x => {
            const tailLight = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.15, 0.05),
                tailLightMat
            );
            tailLight.position.set(x, 0.5, -2);
            group.add(tailLight);
        });

        return group;
    }

    createMotorcycle(color = null) {
        const group = new THREE.Group();
        const bikeColor = color || this.carColors[Math.floor(Math.random() * this.carColors.length)];

        const bodyMat = new THREE.MeshStandardMaterial({
            color: bikeColor,
            metalness: 0.7,
            roughness: 0.3
        });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.8 });

        // Rueda trasera
        const rearWheel = new THREE.Mesh(
            new THREE.TorusGeometry(0.4, 0.15, 8, 16),
            wheelMat
        );
        rearWheel.rotation.y = Math.PI / 2;
        rearWheel.position.set(0, 0.4, -0.8);
        rearWheel.castShadow = true;
        group.add(rearWheel);

        // Rueda delantera
        const frontWheel = new THREE.Mesh(
            new THREE.TorusGeometry(0.4, 0.15, 8, 16),
            wheelMat
        );
        frontWheel.rotation.y = Math.PI / 2;
        frontWheel.position.set(0, 0.4, 0.9);
        frontWheel.castShadow = true;
        group.add(frontWheel);

        // Cuerpo/tanque
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.4, 1.2),
            bodyMat
        );
        body.position.set(0, 0.7, 0);
        body.castShadow = true;
        group.add(body);

        // Asiento
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.15, 0.6),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
        );
        seat.position.set(0, 0.95, -0.3);
        group.add(seat);

        // Manubrio
        const handlebar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8),
            chromeMat
        );
        handlebar.rotation.z = Math.PI / 2;
        handlebar.position.set(0, 1.1, 0.6);
        group.add(handlebar);

        // Conductor
        this.addRider(group, skinMat);

        return group;
    }

    addRider(group, skinMat) {
        const clothesMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8
        });
        const helmetMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.5
        });

        // Cuerpo
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.5, 0.3),
            clothesMat
        );
        torso.position.set(0, 1.3, -0.1);
        torso.rotation.x = 0.2;
        torso.castShadow = true;
        group.add(torso);

        // Cabeza con casco
        const helmet = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            helmetMat
        );
        helmet.position.set(0, 1.7, 0.1);
        helmet.castShadow = true;
        group.add(helmet);

        // Brazos
        [-0.25, 0.25].forEach(x => {
            const arm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8),
                clothesMat
            );
            arm.position.set(x, 1.25, 0.3);
            arm.rotation.x = -0.8;
            group.add(arm);
        });

        // Piernas
        [-0.15, 0.15].forEach(x => {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8),
                clothesMat
            );
            leg.position.set(x, 0.85, -0.4);
            leg.rotation.x = 0.3;
            group.add(leg);
        });
    }
}

export function createVehicle(type = 'car') {
    const factory = new VehicleFactory();
    return type === 'motorcycle' ? factory.createMotorcycle() : factory.createCar();
}
