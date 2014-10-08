/******************************
* Extend Scene Prototype
******************************/
var SequenceMattWebb = function() {
    this.sequence = [];
    this.init();
};

SequenceMattWebb.prototype = new Sequence();

/******************************
* Add Objects
******************************/
SequenceMattWebb.prototype.init = function() {
    // Previous scene objects being reused
    this.scene = sequenceTobiasRebell.scene;

    // Audio
    this.spaceAudio = new Audio('shared/audio/space.mp3');
    this.rocksAudio = new Audio('shared/audio/rocks.mp3');

    // Materials
    //this.cubeMaterial = new THREE.MeshLambertMaterial({color: 'white', opacity: 0, transparent: true});

    this.lineMaterial = new THREE.LineBasicMaterial({color: 'white'});
    this.basicMaterial = new THREE.MeshBasicMaterial ({color: 'white', opacity: 1, transparent: true});
    this.lightMaterial = new THREE.MeshLambertMaterial({color: 'white', opacity: 0, transparent: true});

    // Group
    this.cubeGroup = new THREE.Object3D();

    // Cube
    this.cubeDimensions = sequenceTobiasRebell.cubeDimensions;
    this.cube = new THREE.Mesh(new THREE.BoxGeometry(this.cubeDimensions, this.cubeDimensions, this.cubeDimensions), this.lightMaterial);
    this.cubeGroup.add(this.cube);

    // Sphere
    this.sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 10), this.lightMaterial);
    this.sphere.visible = false;
    this.cubeGroup.add(this.sphere);

    // Fragments
    var loader = new THREE.objLoader();
    var that = this; //cache

    loader.load("shared/js/objs/fragments.obj", function (obj) {
        that.fragments = obj;
        that.fragments.scale.set(0.5, 0.5, 0.5);

        for (var i=0; i<that.fragments.children.length; i++) {
            that.fragments.children[i].material = that.lightMaterial;
            that.fragments.children[i].visible = false;
        }

        that.cubeGroup.add(that.fragments);
    });

    // Triangles
    this.triangles = new THREE.Object3D();

    for (var i = 0; i < 18; i++) {
        var triMesh = this.CreatePolyOutline(3, 7, 0.15);
        triMesh.position.z = (i) * 4 + 10;
        this.triangles.children.push(triMesh);
    }

    this.scene.add(this.triangles);

    // Grid
    this.grid = new THREE.Object3D();
    this.grid.rotation.z = Util.toRadians(45);
    this.grid.add(this.cubeGroup);

    // Camera
    this.camera = sequenceTobiasRebell.camera;
    this.scene.add(this.grid);
};

/******************************
* Add Animations
******************************/
SequenceMattWebb.prototype.showCube = function(cubeGroup, opacity, duration, easing) {
    var cube = cubeGroup.children[0];
    var sphere = cubeGroup.children[1];

    new TWEEN.Tween({opacity: 0})
        .to({opacity: opacity}, duration)
        .easing(easing)
        .onUpdate(function () {
            cube.material.opacity = this.opacity;
            sphere.material.opacity = this.opacity;
        })
    .start();
};

SequenceMattWebb.prototype.positionCubeGroup = function(cubeGroup, position, duration, easing) {
    this.spaceAudio.play();

    var cubeGroupTarget = cubeGroup.position.z + position;

    new TWEEN.Tween({position: cubeGroup.position.z})
        .to({position: cubeGroupTarget}, duration)
        .easing(easing)
        .onUpdate(function () {
            cubeGroup.position.z = this.position;
        })
        .start();
};

SequenceMattWebb.prototype.rotateCubeGroup = function(cubeGroup, rotation, duration, easing) {
    var cube = cubeGroup.children[0];
    var fragments = cubeGroup.children[2];

    // Cube
    new TWEEN.Tween({index: i, rotation: 0})
            .to({rotation: rotation}, duration)
            .easing(easing)
            .onUpdate(function () {
                cube.rotation.x = this.rotation;
                cube.rotation.y = this.rotation;
                cube.rotation.z = this.rotation;
            })
        .start();

    // Fragments
    for (var i=0; i<cubeGroup.children[2].children.length; i++) {
        new TWEEN.Tween({index: i, rotation: 0})
            .to({rotation: rotation}, duration)
            .easing(easing)
            .onUpdate(function () {
                fragments.children[this.index].rotation.x = this.rotation;
                fragments.children[this.index].rotation.y = this.rotation;
                fragments.children[this.index].rotation.z = this.rotation;
            })
        .start();
    }
};

SequenceMattWebb.prototype.explodeCubeGroup = function(cubeGroup, duration, easing) {
    this.rocksAudio.play();

    var cube = cubeGroup.children[0];
    var sphere = cubeGroup.children[1];
    var fragments = cubeGroup.children[2];

    // Hide cube
    cube.visible = false;
    sphere.visible = true;

    for (var i=0; i<fragments.children.length - 1; i++) {
        fragments.children[i].visible = true;

        new TWEEN.Tween({
            index: i,
            x: fragments.children[i].position.x,
            y: fragments.children[i].position.y,
            z: fragments.children[i].position.z})

            .to({
                x: fragments.children[i].position.x + -60 + Math.random()*120,
                y: fragments.children[i].position.y + -60 + Math.random()*120,
                z: -600

            }, duration)
            .easing(easing)
            .delay(i * Math.random() * 20)
            .onUpdate(function () {
                fragments.children[this.index].position.x = this.x;
                fragments.children[this.index].position.y = this.y;
                fragments.children[this.index].position.z = this.z;
            })
        .start();
    }
};

SequenceMattWebb.prototype.CreatePolyOutline = function(sides, radius, linewidth) {
    if (sides === undefined || sides < 2) sides = 2;
    if (radius === undefined) radius = 1;
    if (linewidth === undefined) linewidth = radius * 0.1;

    var offset = linewidth / 2;
    var interiorRadius = radius - offset;
    var exteriorRadius = radius + offset;
    var nPoints = sides * 2;

    var ninetyDeg = Math.PI /  2;
    var angle = 2 * Math.PI / sides;
    var geo = new THREE.Geometry();

    for (var i = 0; i < sides; i++) {

        var calcAngle = i * angle + ninetyDeg;

        geo.vertices.push(
            new THREE.Vector3(Math.cos(calcAngle) * interiorRadius, Math.sin(calcAngle) * interiorRadius, 0));

        geo.vertices.push(
            new THREE.Vector3(Math.cos(calcAngle) * exteriorRadius, Math.sin(calcAngle) * exteriorRadius, 0));

        var iA = i*2;
        var iB = iA + 1;
        var iC = (iA + 2) % nPoints;
        var iD = (iA + 3) % nPoints;

        geo.faces.push(new THREE.Face3(iA, iB, iC));
        geo.faces.push(new THREE.Face3(iB, iC, iD));
    }

    var mtl = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    // var mtl = new THREE.MeshPhongMaterial({ ambient: 0xffffff, side: THREE.DoubleSide });
    var mesh = new THREE.Mesh(geo, mtl);
    mesh.doubleSided = true;

    return mesh;
}


/******************************
* Initialize New Scene
******************************/
var sequenceMattWebb = new SequenceMattWebb();

/******************************
* Add Sequences
******************************/
sequenceMattWebb.addEvent('00:05:20', sequenceMattWebb.showCube, [sequenceMattWebb.cubeGroup, 1, 2000, TWEEN.Easing.Exponential.InOut]);
sequenceMattWebb.addEvent('00:07:10', sequenceMattWebb.cameraMovement, [sequenceMattWebb.camera, false, -2, 0, 78, 8000, TWEEN.Easing.Exponential.InOut]);

// Fly through
sequenceMattWebb.addEvent('00:07:10', sequenceMattWebb.positionCubeGroup, [sequenceMattWebb.cubeGroup, 76, 8000, TWEEN.Easing.Exponential.InOut]);
sequenceMattWebb.addEvent('00:07:15', sequenceMattWebb.rotateCubeGroup, [sequenceMattWebb.cubeGroup, Util.toRadians(720), 8000, TWEEN.Easing.Exponential.InOut]);

sequenceMattWebb.addEvent('00:10:15', sequenceMattWebb.explodeCubeGroup, [sequenceMattWebb.cubeGroup, 6000, TWEEN.Easing.Quadratic.InOut]);

var speaker3 = new Glitch ('GENEVIEVE BELL', -350, -50);
sequenceTobiasRebell.addEvent('00:14:00', function() {speaker3.animateIn()});
sequenceTobiasRebell.addEvent('00:20:00', function() {speaker3.animateOut()})

sequenceMattWebb.addEvent('00:16:10', sequenceMattWebb.cameraMovement, [sequenceMattWebb.camera, false, 2, 0, -8, 2000, TWEEN.Easing.Exponential.InOut]);

sequences.push(sequenceMattWebb);