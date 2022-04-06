let view;
let ctx;
let scene;
let start_time;

const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

// Initialization function - called when web page loads
function init() {
    let w = 800;
    let h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'perspective',
            prp: Vector3(44, 20, -16),
            srp: Vector3(20, 20, -40),
            vup: Vector3(0, 1, 0),
            clip: [-19, 5, -10, 8, 12, 100],
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ],
                matrix: new Matrix(4, 4)
            }
        ]
    };

    // event handler for pressing arrow keys
    document.addEventListener('keydown', onKeyDown, false);
    
    // start animation loop
    start_time = performance.now(); // current timestamp in milliseconds
    window.requestAnimationFrame(animate);
}

// Animation loop - repeatedly calls rendering code
function animate(timestamp) {
    // step 1: calculate time (time since start)
    let time = timestamp - start_time;
    
    // step 2: transform models based on time
    // TODO: implement this!

    // step 3: draw scene
    drawScene();

    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)
    // window.requestAnimationFrame(animate);
}

// Main drawing code - use information contained in variable `scene`
function drawScene() {

    let finalmatrix;

    if (scene.view.type == 'perspective') {
        console.log('perspective');
        let nper = mat4x4Perspective(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
        let mper = mat4x4MPer();
        finalmatrix = mper.mult(nper);

    } else if (scene.view.type == 'parallel') {
        console.log('parallel');
        let npar = mat4x4Parallel(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
        let mpar = mat4x4MPar();
        finalmatrix = mpar.mult(npar);

    }
   

    // TODO: implement drawing here!
    

    let models = scene.models;
    
    let finalpoints = [];

    // For each model, for each edge
    for (let i = 0; i < models.length; i ++) {
        // each model
        let vertices = models[i].vertices;
        let edges = models[i].edges;

        //  * transform to canonical view volume (this is done, i believe)
        //  * clip in 3D (has to be done using the sutherland algo)
        //  * project to 2D (hard coded currently to fit on the screen)
        for (let i = 0; i < vertices.length; i ++) {
            let product = finalmatrix.mult(vertices[i]);
            let final = [(product.values[0] / product.values[3]), (product.values[1] / product.values[3])];
            let finalpoint = {x: (final[0] * (view.width/2) + 200), y: (final[1] * (view.height/2) + 300)}; // hard coded extra values to make it easier to see for now
            finalpoints.push(finalpoint);
        }
        //  * draw line
        for (let j = 0; j < edges.length; j++) {
            // each set of edges
            for (let k = 0; k < edges[j].length; k++) {
                // each individual vertice in the list of edges
                if (k == edges[j].length-1) {
                    drawLine(finalpoints[edges[j][edges[j].length-1]].x, finalpoints[edges[j][edges[j].length-1]].y, finalpoints[edges[j][0]].x, finalpoints[edges[j][0]].y);
                } else {
                    drawLine(finalpoints[edges[j][k]].x, finalpoints[edges[j][k]].y, finalpoints[edges[j][k+1]].x, finalpoints[edges[j][k+1]].y);

                }
            }
        }
    }


    
    
}

// Get outcode for vertex (parallel view volume)
function outcodeParallel(vertex) {
    let outcode = 0;
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (1.0 + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (-1.0 - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (1.0 + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.z > (0.0 + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Get outcode for vertex (perspective view volume)
function outcodePerspective(vertex, z_min) {
    let outcode = 0;
    if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.z > (z_min + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLineParallel(line) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodeParallel(p0);
    let out1 = outcodeParallel(p1);
    
    // TODO: implement clipping here!
    
    return result;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);

    if ((out0 | out1) == 0) {
        // trivial accept, entire edge is inside of bounds, no clipping needed
        return line;
    } else if ((out0 & out1) != 0) {
        // trivial deny, entire edge is outside of bounds, no clipping needed
        return null;
    } else if (out0 != 0) {
        // need to clip
        if (out0 == LEFT) {
            line.pt0.x = clip[0];
        } else if (out0 == RIGHT) {
            line.pt0.x = clip[1];
        } else if (out0 == BOTTOM) {
            line.pt0.y = clip[2];
        } else if (out0 == TOP) {
            line.pt0.y = clip[3];
        } else if (out0 == NEAR) {
            line.pt0.z = clip[4];
        } else if (out0 == FAR) {
            line.pt0.z = clip[5];
        }
    } else if (out1 != 0) {
        if (out1 == LEFT) {
            line.pt1.x = clip[0];
        } else if (out1 == RIGHT) {
            line.pt1.x = clip[1];
        } else if (out1 == BOTTOM) {
            line.pt1.y = clip[2];
        } else if (out1 == TOP) {
            line.pt1.y = clip[3];
        } else if (out1 == NEAR) {
            line.pt1.z = clip[4];
        } else if (out1 == FAR) {
            line.pt1.z = clip[5];
        }
    }


    
    // TODO: implement clipping here!
    
    return line;
}

// Called when user presses a key on the keyboard down 
function onKeyDown(event) {
    
    switch (event.keyCode) {
        
        case 37: // LEFT Arrow
            console.log("left");
            n = scene.view.prp.subtract(scene.view.srp);
            n.normalize();
            u = scene.view.vup.cross(n);
            u.normalize();
            v = n.cross(u);
            //scene.view.prp = scene.view.prp.subtract(n);
            scene.view.srp = scene.view.srp.subtract(u);

            ctx.clearRect(0, 0, view.width, view.height);
            drawScene();
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            n = scene.view.prp.subtract(scene.view.srp);
            n.normalize();
            u = scene.view.vup.cross(n);
            u.normalize();
            v = n.cross(u);
            //scene.view.prp = scene.view.prp.add(n);
            scene.view.srp = scene.view.srp.add(u);

            ctx.clearRect(0, 0, view.width, view.height);
            drawScene();
            break;
        case 65: // A key

            n = scene.view.prp.subtract(scene.view.srp);
            n.normalize();
            u = scene.view.vup.cross(n);
            u.normalize();
            scene.view.prp = scene.view.prp.subtract(u);
            scene.view.srp = scene.view.srp.subtract(u);

            ctx.clearRect(0, 0, view.width, view.height);
            drawScene();
            console.log("A");
            break;
        case 68: // D key
            console.log("D");

            n = scene.view.prp.subtract(scene.view.srp);
            n.normalize();
            u = scene.view.vup.cross(n);
            u.normalize();
            scene.view.prp = scene.view.prp.add(u);
            scene.view.srp = scene.view.srp.add(u);
            ctx.clearRect(0, 0, view.width, view.height);
            drawScene();
            break;
        case 83: // S key
            console.log("S");

            n = scene.view.prp.subtract(scene.view.srp);
            n.normalize();
            u = scene.view.vup.cross(n);
            u.normalize();
            scene.view.prp = scene.view.prp.subtract(n);
            scene.view.srp = scene.view.srp.subtract(n);
            ctx.clearRect(0, 0, view.width, view.height);
            drawScene();
            break;
        case 87: // W key
            console.log("W");

            n = scene.view.prp.subtract(scene.view.srp);
            n.normalize();
            u = scene.view.vup.cross(n);
            u.normalize();
            scene.view.prp = scene.view.prp.add(n);
            scene.view.srp = scene.view.srp.add(n);
            ctx.clearRect(0, 0, view.width, view.height);
            drawScene();
            break;
    }
}

///////////////////////////////////////////////////////////////////////////
// No need to edit functions beyond this point
///////////////////////////////////////////////////////////////////////////

// Called when user selects a new scene JSON file
function loadNewScene() {
    let scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    let reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);
        scene.view.srp = Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
            scene.models[i].matrix = new Matrix(4, 4);
        }
    };
    reader.readAsText(scene_file.files[0], 'UTF-8');
}

// Draw black 2D line with red endpoints 
function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}
