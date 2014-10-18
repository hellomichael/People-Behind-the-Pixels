/******************************
* Extend Scene Prototype
******************************/
var SequenceYJ = function() {
    this.sequence = [];
    this.init();
};

SequenceYJ.prototype = new Sequence();

SequenceYJ.prototype.init = function() {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 5, 1000);
    this.camera.position.z = 10;
    this.screenDimensions = Util.getScreenDimensions(this.camera);

    // Renderator
    renderator.reset(this.scene, this.camera,
        {
            postProcessEnabled      : false,

            blurEnabled             : true,
            blurAmount              : 3,
            blurPosition            : 0.3,

            bloomEnabled            : false,
            aaEnabled               : true
        }
    );

    // Materials
    this.lineMaterial  = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true});
    this.basicMaterial = new THREE.MeshBasicMaterial({color: 0x222222, opacity: 1, transparent: true, side: THREE.DoubleSide});
    this.lightMaterial = new THREE.MeshLambertMaterial({color: 0x222222, opacity: 1, transparent: true, side: THREE.DoubleSide});

    // Lights
    this.directionalLight = new THREE.DirectionalLight(0x999999);
    this.directionalLight.position.set(0, 10000, 100).normalize();
    this.scene.add(this.directionalLight);

    this.ambientLight = new THREE.AmbientLight(0x999999);
    this.scene.add(this.ambientLight);

    /******************************
    * Add Objects
    ******************************/
    this.tetrahedronScale = 2.5;
    this.tetrahedron = new TetrahedronMesh(this.tetrahedronScale);
    this.tetrahedron.rotation.x = Util.toRadians(-85);
    //this.tetrahedron.position.y = -this.screenDimensions[1]/tetrahedronScale;

    this.tetrahedron.children[1].rotateOnAxis(Util.getVector(270), Util.toRadians(-109.5));
    this.tetrahedron.children[2].rotateOnAxis(Util.getVector(270), Util.toRadians(-109.5));
    this.tetrahedron.children[3].rotateOnAxis(Util.getVector(270), Util.toRadians(-109.5));

    this.scene.add(this.tetrahedron);
};

/******************************
* Create Animations
******************************/
SequenceYJ.prototype.unFold = function(tetrahedronFace, rotation, axis, duration, easing) {
    var prevRotation = -109.45;

    new TWEEN.Tween({rotation: prevRotation})
        .to({rotation: rotation}, duration)
        .easing(easing)
        .onUpdate(function () {
            // Reset matrix
            tetrahedronFace.rotateOnAxis(axis, Util.toRadians(-prevRotation));

            // Set matrix
            tetrahedronFace.rotateOnAxis(axis, Util.toRadians(this.rotation));
            prevRotation = this.rotation;
        })
    .start();
};

SequenceYJ.prototype.showWireframe = function(tetrahedron, opacity, duration, easing) {
    new TWEEN.Tween({opacity: tetrahedron.children[1].children[1].material.opacity})
        .to({opacity: opacity}, duration)
        .easing(easing)
        .onUpdate(function () {
            tetrahedron.children[1].children[1].material.opacity = this.opacity;
            tetrahedron.children[2].children[1].material.opacity = this.opacity;
            tetrahedron.children[3].children[1].material.opacity = this.opacity;
        })
    .start();
};


SequenceYJ.prototype.rotateTetrahedron = function(tetrahedron, rotation, duration, easing) {
    new TWEEN.Tween({rotation: tetrahedron.rotation.x})
        .to({rotation: rotation}, duration)
        .easing(easing)
        .onUpdate(function () {
            tetrahedron.rotation.x = this.rotation;
        })
    .start();
};

/******************************
* Add Events
******************************/
var sequenceYJ = new SequenceYJ();

/*var glitchYJ = new Glitch ('YOUNGHEE JUNG', 0, -150);
sequenceYJ.addEvent('00:05:00', function() {glitchYJ.animateIn()});
sequenceYJ.addEvent('00:10:00', function() {glitchYJ.animateOut()});*/

sequenceYJ.addEvent('00:03:00', function () {
    sequenceYJ.nextScene(sequenceYJ.scene, sequenceYJ.camera, true, true, 2, 0.75);
});

// Move camera
sequenceYJ.addEvent('00:02:25', sequenceYJ.cameraMovement, [sequenceYJ.camera, false, 0, -sequenceYJ.screenDimensions[1]/sequenceYJ.tetrahedronScale + 5, 0, 3000, TWEEN.Easing.Exponential.InOut]);


// Rotate tetrahedron
sequenceYJ.addEvent('00:02:25', function () {
    sequenceYJ.rotateTetrahedron(sequenceYJ.tetrahedron, Util.toRadians(-90), 3000, TWEEN.Easing.Quadratic.InOut);
});

// Open flower
sequenceYJ.addEvent('00:03:00', function () {
    sequenceYJ.unFold(sequenceYJ.tetrahedron.children[1], 0, Util.getVector(270), 3000, TWEEN.Easing.Exponential.InOut)
});

sequenceYJ.addEvent('00:03:00', function () {
    sequenceYJ.unFold(sequenceYJ.tetrahedron.children[2], 0, Util.getVector(270), 3000, TWEEN.Easing.Exponential.InOut)
});

sequenceYJ.addEvent('00:03:00', function () {
    sequenceYJ.unFold(sequenceYJ.tetrahedron.children[3], 0, Util.getVector(270), 3000, TWEEN.Easing.Exponential.InOut)
});

sequenceYJ.addEvent('00:03:15', function () {
    sequenceYJ.showWireframe(sequenceYJ.tetrahedron, 1, 1200, TWEEN.Easing.Quadratic.InOut)
});


/******************************
* Add to Timeline
******************************/
timeline.push(sequenceYJ);