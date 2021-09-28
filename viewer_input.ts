﻿const KEYS = {
    A: 65,
    D: 68,
    Q: 81,
    E: 69,
    S: 83,
    W: 87,
    LEFTARROW: 37,
    UPARROW: 38,
    RIGHTARROW: 39,
    DOWNARROW: 40,
    HOME: 36,
    END: 37,
    PAGEUP: 33,
    PAGEDOWN: 34,
};

class ViewerInput {

    canvas: HTMLCanvasElement;
    settings: any;
    cameraController: ViewerCamera;
    unregister: Function;
    isMouseDown: Boolean;

    // TODO reorganize  
    mesh: any;
    scene: any;
    vim: any;

    constructor(canvas: HTMLCanvasElement, settings: any, cameraController: ViewerCamera) {
        this.canvas = canvas;
        this.settings = settings;
        this.cameraController = cameraController;
        this.unregister = function () { };
        this.isMouseDown = false;
    }

    register() {
        this.canvas.addEventListener('mousedown', this.onMouseDown);
        this.canvas.addEventListener('wheel', this.onMouseWheel);
        this.canvas.addEventListener('mousemove', this.onMouseMove);
        this.canvas.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('keydown', this.onKeyDown);

        this.unregister = function() {
            this.canvas.removeEventListener('mousedown', this.onMouseDown);
            this.canvas.removeEventListener('wheel', this.onMouseWheel);
            this.canvas.removeEventListener('mousemove', this.onMouseMove);
            this.canvas.removeEventListener('mouseup', this.onMouseUp);
            document.removeEventListener('keydown', this.onKeyDown);

            this.isMouseDown = false;
            this.unregister = function() { };
        };
    }

    onKeyDown = (event) => {
        let speed = this.settings.camera.controls.speed;
        if (event.shiftKey)
            speed *= this.settings.camera.controls.shiftMultiplier;
        if (event.altKey)
            speed *= this.settings.camera.controls.altMultiplier;
        switch (event.keyCode) {
            case KEYS.A:
                this.cameraController.moveCameraBy(direction.left, speed);
                break;
            case KEYS.LEFTARROW:
                this.cameraController.moveCameraBy(direction.left, speed, true);
                break;
            case KEYS.D:
                this.cameraController.moveCameraBy(direction.right, speed);
                break;
            case KEYS.RIGHTARROW:
                this.cameraController.moveCameraBy(direction.right, speed, true);
                break;
            case KEYS.W:
                this.cameraController.moveCameraBy(direction.forward, speed);
                break;
            case KEYS.UPARROW:
                this.cameraController.moveCameraBy(direction.forward, speed, true);
                break;
            case KEYS.S:
                this.cameraController.moveCameraBy(direction.back, speed);
                break;
            case KEYS.DOWNARROW:
                this.cameraController.moveCameraBy(direction.back, speed, true);
                break;
            case KEYS.E:
            case KEYS.PAGEUP:
                this.cameraController.moveCameraBy(direction.up, speed);
                break;
            case KEYS.Q:
            case KEYS.PAGEDOWN:
                this.cameraController.moveCameraBy(direction.down, speed);
                break;
            case KEYS.HOME:
                this.cameraController.resetCamera();
                break;
            default:
                return;
        }
        event.preventDefault();
    };

    onMouseMove = (event) => {
        if (!this.isMouseDown)
            return;

        event.preventDefault();

        // https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/PointerLockControls.js
        const deltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const deltaY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        const delta = new THREE.Vector2(deltaX, deltaY);

        if (event.buttons & 2)
            this.cameraController.panCameraBy(delta);

        else
            this.cameraController.rotateCameraBy(delta);
    };

    onMouseWheel = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const speed = this.settings.camera.controls.zoomSpeed;
        const dir = event.deltaY > 0 ? direction.back : direction.forward;
        this.cameraController.moveCameraBy(dir, speed);
    };

    onMouseDown = (event) => {
        event.preventDefault();
        this.isMouseDown = true;
        
        let x = (event.clientX / window.innerWidth) * 2 - 1;
        let y = - (event.clientY / window.innerHeight) * 2 + 1;
        let mouse = new THREE.Vector2(x, y);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.cameraController.camera);

        raycaster.firstHitOnly = true;
        let hit = raycaster.intersectObjects(this.mesh);
        if (hit.length > 0) {
            console.log("Hit at " + hit[0].point.x + "," + hit[0].point.y + "," + hit[0].point.z);

            /*
            let target = hit[0].object;
            let index = hit[0].instanceId;
            let nodeIndex = target.userData.instanceIndices[index];

            let elementIndex = this.vim.entities["Vim.Node"]["Rvt.Element"][nodeIndex];
            let stringIndex = this.vim.entities["Rvt.Element"]["Name"][elementIndex];
            let name = this.vim.strings[stringIndex];
            console.log("Element: " + name);
            */

            let material = new THREE.MeshBasicMaterial();
            let s = new THREE.IcosahedronBufferGeometry(0.1, 100);
            let mesh = new THREE.Mesh(s, material);
            mesh.position.copy(hit[0].point);
            this.scene.add(mesh);
        }
        else {
            console.log("nohit");
        }


        // Manually set the focus since calling preventDefault above
        // prevents the browser from setting it automatically.    
        this.canvas.focus ? this.canvas.focus() : window.focus();
    };

    onMouseUp = (_) => {
        this.isMouseDown = false;
    };
}
