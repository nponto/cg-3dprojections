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
            },
            {
                type: 'cone',
                center: [10, 10, -30],
                radius: 10,
                height: 20,
                sides: 10,
            },
            {
                type: 'cube',
                center: [4, 4, -10],
                width: 8,
                height: 8,
                depth: 8,
            },
            {
                type: 'sphere',
                center: [10, 10, -20],
                radius: 10,
                slices: 12,
                stacks: 12,
            },
            {
                type: 'cylinder',
                center: [10, 10, -20],
                radius: 10,
                height: 10,
                sides: 12,
            },
            
            
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


    let canonicalViewMatrix;
    let projectionMatrix; 

   // drawCube();


    if (scene.view.type == 'perspective') {
        canonicalViewMatrix = mat4x4Perspective(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
        projectionMatrix = mat4x4MPer();
    } else if (scene.view.type == 'parallel') {
        canonicalViewMatrix = mat4x4Parallel(scene.view.prp, scene.view.srp, scene.view.vup, scene.view.clip);
        projectionMatrix = mat4x4MPar();
    }

    // TODO: implement drawing here!
    

    let models = scene.models;
    
    // For each model, for each edge
    for (let i = 0; i < models.length; i ++) {
        // each model

        console.log(models[i].type);

        if (models[i].type == 'generic') {
            //console.log("generic");
            let vertices = models[i].vertices;
            let edges = models[i].edges;

        //  * transform to canonical view volume (this is done, i believe)
        //  * clip in 3D (has to be done using the sutherland algo)
        let verticesList = [];
        
        for (let i = 0; i < vertices.length; i ++) {
            verticesList.push(Matrix.multiply([canonicalViewMatrix, vertices[i]]));
        }

        // clip here, then project to 2d


        for (let j = 0; j < edges.length; j++) {
            // each set of edges
            for (let k = 0; k < edges[j].length-1; k++) {
                // each individual vertice in the list of edges
                let p0 = verticesList[edges[j][k]];
                let p1 = verticesList[edges[j][k+1]];

                let line = {pt0: p0, pt1: p1};
                let newLine = line;

                // todo add clipping here
                newLine = clipLinePerspective(line, -1*(scene.view.clip[4]/scene.view.clip[5]));
                //newLine = clipLineParallel(line);
                if (newLine != null) {
                    let p02d = Matrix.multiply([projectionMatrix, newLine.pt0]); // put V in here
                    let p12d = Matrix.multiply([projectionMatrix, newLine.pt1]); // put V in here

                    p02d.x = p02d.x / p02d.w;
                    p12d.x = p12d.x / p12d.w;
                    p02d.y = p02d.y / p02d.w;
                    p12d.y = p12d.y / p12d.w;
                    drawLine((p02d.x + 1) * view.width/2, (p02d.y + 1) * view.height/2, (p12d.x + 1) * view.width/2, (p12d.y +1) * view.height/2);
                }
                
                

            }
        }
        } else if (models[i].type == 'cube') {
            let vertices = [];
            let edges = [];
            let x = models[i].center[0];
            let y = models[i].center[1];
            let z = models[i].center[2];
            halfheight = models[i].height/2;
            halfwidth = models[i].width/2;
            halfdepth = models[i].depth/2;

            vertices.push(Vector4((x - halfwidth), (y - halfheight), (z - halfdepth), 1)); // 0
            vertices.push(Vector4((x - halfwidth), (y - halfheight), (z + halfdepth), 1)); // 1
            vertices.push(Vector4((x - halfwidth), (y + halfheight), (z - halfdepth), 1)); // 2
            vertices.push(Vector4((x - halfwidth), (y + halfheight), (z + halfdepth), 1)); // 3
            vertices.push(Vector4((x + halfwidth), (y - halfheight), (z - halfdepth), 1)); // 4
            vertices.push(Vector4((x + halfwidth), (y - halfheight), (z + halfdepth), 1)); // 5
            vertices.push(Vector4((x + halfwidth), (y + halfheight), (z - halfdepth), 1)); // 6
            vertices.push(Vector4((x + halfwidth), (y + halfheight), (z + halfdepth), 1)); // 7

            console.log(vertices);

            edges.push([0,2,6,4,0]);
            edges.push([1,3,7,5,1]);
            edges.push([0,1]);
            edges.push([2,3]);
            edges.push([4,5]);
            edges.push([6,7]);
        
        let verticesList = [];
        
        for (let i = 0; i < vertices.length; i ++) {
            verticesList.push(Matrix.multiply([canonicalViewMatrix, vertices[i]]));
        }

        // clip here, then project to 2d


        for (let j = 0; j < edges.length; j++) {
            //console.log("hello");
            // each set of edges
            for (let k = 0; k < edges[j].length-1; k++) {
                //console.log("hello");
                // each individual vertice in the list of edges
                let p0 = verticesList[edges[j][k]];
                let p1 = verticesList[edges[j][k+1]];

                let line = {pt0: p0, pt1: p1};
                let newLine = line;

                // todo add clipping here
                //newLine = clipLinePerspective(line, -1*(scene.view.clip[4]/scene.view.clip[5]));
                //newLine = clipLineParallel(line);
                if (newLine != null) {
                    //console.log("hello");
                    let p02d = Matrix.multiply([projectionMatrix, newLine.pt0]); // put V in here
                    let p12d = Matrix.multiply([projectionMatrix, newLine.pt1]); // put V in here

                    p02d.x = p02d.x / p02d.w;
                    p12d.x = p12d.x / p12d.w;
                    p02d.y = p02d.y / p02d.w;
                    p12d.y = p12d.y / p12d.w;
                    drawLine((p02d.x + 1) * view.width/2, (p02d.y + 1) * view.height/2, (p12d.x + 1) * view.width/2, (p12d.y +1) * view.height/2);
                }
                
                

            }
        }

        } else if (models[i].type == 'cone') {


            let cone = models[i];

            let vertices = [];
            let edges = [];
            let x = cone.center[0];
            let y = cone.center[1];
            let z = cone.center[2];
            let height = cone.height;
            let radius = cone.radius;
            let sides = cone.sides;

            for (let i = 0; i < sides; i++) {
                let angle = (i / sides) * (2 * Math.PI);
                let newx = x + radius * Math.cos(angle);
                let newy = y + radius * Math.sin(angle);
                vertices.push(Vector4(newx, newy, z + radius, 1));
                
                if (i < sides - 1) {
                    edges.push([i, i+1]);
                } else if (i == sides - 1) {
                    edges.push([i, 0]);

                }
                
            }
            vertices.push(Vector4(cone.center[0], (cone.center[1]), cone.center[2]+height, 1));


            for (let i = 0; i < sides; i++) {
                edges.push([i, sides]);
            }
            edges.push([0,sides]);

            let verticesList = [];
        
        for (let i = 0; i < vertices.length; i ++) {
            verticesList.push(Matrix.multiply([canonicalViewMatrix, vertices[i]]));
        }

        // clip here, then project to 2d


        for (let j = 0; j < edges.length; j++) {
            // each set of edges
            for (let k = 0; k < edges[j].length-1; k++) {
                //console.log(edges[j]);
                // each individual vertice in the list of edges
                let p0 = verticesList[edges[j][k]];
                let p1 = verticesList[edges[j][k+1]];

                let line = {pt0: p0, pt1: p1};
                let newLine = line;

                // todo add clipping here
                //newLine = clipLinePerspective(line, -1*(scene.view.clip[4]/scene.view.clip[5]));
                //newLine = clipLineParallel(line);
                if (newLine != null) {
                    //console.log("hello");
                    let p02d = Matrix.multiply([projectionMatrix, newLine.pt0]); // put V in here
                    let p12d = Matrix.multiply([projectionMatrix, newLine.pt1]); // put V in here
                    //console.log("K = " + k + " " + newLine);

                    p02d.x = p02d.x / p02d.w;
                    p12d.x = p12d.x / p12d.w;
                    p02d.y = p02d.y / p02d.w;
                    p12d.y = p12d.y / p12d.w;
                    drawLine((p02d.x + 1) * view.width/2, (p02d.y + 1) * view.height/2, (p12d.x + 1) * view.width/2, (p12d.y +1) * view.height/2);
                }
                
                

            }
        }

            



        } else if (models[i].type == "cylinder") {
            let cylinder = models[i];

            //console.log(cone);

            let vertices = [];
            let edges = [];
            let x = cylinder.center[0];
            let y = cylinder.center[1];
            let z = cylinder.center[2];
            let height = cylinder.height;
            let radius = cylinder.radius;
            let sides = cylinder.sides * 2;

            for (let i = 0; i < sides/2; i++) {
                let angle = (i / (sides/2)) * (2 * Math.PI);
                let newx = x + radius * Math.cos(angle);
                let newy = y + radius * Math.sin(angle);
                vertices.push(Vector4(newx, newy, z + height, 1));
                
                if (i < sides/2 - 1) {
                    edges.push([i, i+1]);
                } else if (i == sides/2 - 1) {
                    edges.push([i, 0]);

                }
                
            }
            
           

            for (let i = sides/2; i < sides; i++) {
                let angle = (i / (sides/2)) * (2 * Math.PI);
                let newx = x + radius * Math.cos(angle);
                let newy = y + radius * Math.sin(angle);
                vertices.push(Vector4(newx, newy, z - height, 1));

                
                if (i < sides - 1) {
                    edges.push([i, i+1]);
                } else if (i == sides - 1) {
                    edges.push([i, sides/2]);

                }
                
            }

            for (let i = 0; i < sides; i++) {
                if (i < sides - 1) {
                    edges.push([i, i+(sides/2)]);
                } else if (i == sides - 1) {
                    edges.push(i, sides);
                }
            }
            
           

            let verticesList = [];
        
        for (let i = 0; i < vertices.length; i ++) {
            verticesList.push(Matrix.multiply([canonicalViewMatrix, vertices[i]]));
        }

        // clip here, then project to 2d


        for (let j = 0; j < edges.length; j++) {
            // each set of edges
            for (let k = 0; k < edges[j].length-1; k++) {
                //console.log(edges[j]);
                // each individual vertice in the list of edges
                let p0 = verticesList[edges[j][k]];
                let p1 = verticesList[edges[j][k+1]];

                let line = {pt0: p0, pt1: p1};
                let newLine = line;

                // todo add clipping here
                //newLine = clipLinePerspective(line, -1*(scene.view.clip[4]/scene.view.clip[5]));
                //newLine = clipLineParallel(line);
                if (newLine != null) {
                    //console.log("hello");
                    let p02d = Matrix.multiply([projectionMatrix, newLine.pt0]); // put V in here
                    let p12d = Matrix.multiply([projectionMatrix, newLine.pt1]); // put V in here
                    //console.log("K = " + k + " " + newLine);

                    p02d.x = p02d.x / p02d.w;
                    p12d.x = p12d.x / p12d.w;
                    p02d.y = p02d.y / p02d.w;
                    p12d.y = p12d.y / p12d.w;
                    drawLine((p02d.x + 1) * view.width/2, (p02d.y + 1) * view.height/2, (p12d.x + 1) * view.width/2, (p12d.y +1) * view.height/2);
                }
                
                

            }
        }
        } else if (models[i].type == "sphere") {
            let sphere = models[i];


            let vertices = [];
            let edges = [];
            let x = sphere.center[0];
            let y = sphere.center[1];
            let z = sphere.center[2];
            let radius = sphere.radius;
            let slices = sphere.slices;
            let stacks = sphere.stacks;
            let sides = 12;




            xmatrix = new Matrix(4,4);
            xmatrix.values = [[1, 0, 0, 0],
                                [0, Math.cos(90), -Math.sin(90), 0],
                                [0, Math.sin(90), Math.cos(90), 0],
                                [0, 0, 0, 1]]; 

            ymatrix = new Matrix(4,4);
            ymatrix.values = [[Math.cos(90), 0, Math.sin(90), 0],
                                [0, 1, 0, 0],
                                [-Math.sin(90), 0, Math.cos(90), 0],
                                [0, 0, 0, 1]]; 

            let temp = Matrix.multiply([ymatrix, xmatrix]);


            let secondradius = radius;
            

            for (let j = slices/2; j < slices; j++) {
                secondradius = secondradius * (.9);
                for (i = 0; i < sides; i++) {
                    let angle = (i / (sides)) * (2 * Math.PI);
                    let newx = x + (secondradius) * Math.cos(angle);
                    let newy = y + (secondradius) * Math.sin(angle);
                    let newz = z - j;
                    vertices.push(Vector4(newx, newy, newz, 1));                    
                    if (i < sides - 1) {
                        edges.push([i + (j * sides), (i + (j * sides)) + 1]);
                    } else if (i == sides - 1) {
                        edges.push([i + (j * sides), 0 + (j * sides)]);
                    }
                }

            }

            let firstradius = secondradius;

            for (let j = 0; j < slices/2; j++) {
                firstradius = firstradius * (10/9);
                for (i = 0; i < sides; i++) {
                    let angle = (i / (sides)) * (2 * Math.PI);
                    let newx = x + (firstradius) * Math.cos(angle);
                    let newy = y + (firstradius) * Math.sin(angle);
                    let newz = z - j;
                    vertices.push(Vector4(newx, newy, newz, 1));
                    if (i < sides - 1) {
                        edges.push([i + (j * sides), (i + (j * sides)) + 1]);
                    } else if (i == sides - 1) {
                        edges.push([i + (j * sides), 0 + (j * sides)]);
                    }
                        
                }
                
            }

            let fourthradius = radius;

            for (let j = stacks/2; j < stacks; j++) {
                fourthradius = fourthradius * (.9);
                for (i = 0; i < sides; i++) {
                    let angle = (i / (sides)) * (2 * Math.PI);
                    let newx = x + (fourthradius) * Math.cos(angle);
                    let newy = y + (fourthradius) * Math.sin(angle);
                    let newz = z - j;
                    vertices.push(Matrix.multiply([temp, Vector4(newx, newy, newz, 1)]));                    
                    if (i < sides - 1) {
                        edges.push([i + (j * sides), (i + (j * sides)) + 1]);
                    } else if (i == sides - 1) {
                        edges.push([i + (j * sides), 0 + (j * sides)]);
                    }
                }

            }

            let thirdradius = fourthradius;

            for (let j = 0; j < stacks/2; j++) {
                thirdradius = thirdradius * (10/9);
                for (i = 0; i < sides; i++) {
                    let angle = (i / (sides)) * (2 * Math.PI);
                    let newx = x + (thirdradius) * Math.cos(angle);
                    let newy = y + (thirdradius) * Math.sin(angle);
                    let newz = z - j;
                    vertices.push(Matrix.multiply([temp, Vector4(newx, newy, newz, 1)]));
                    
                    if (i < sides - 1) {
                        edges.push([i + (j * sides), (i + (j * sides)) + 1]);
                    } else if (i == sides - 1) {
                        edges.push([i + (j * sides), 0 + (j * sides)]);
                    }
                        
                }
                
            }

            

         
            console.log(vertices);
            console.log(edges);
            
            
            
            
            let verticesList = [];
        
        for (let i = 0; i < vertices.length; i ++) {
            verticesList.push(Matrix.multiply([canonicalViewMatrix, vertices[i]]));
        }

        // clip here, then project to 2d


        for (let j = 0; j < edges.length; j++) {
            // each set of edges
            for (let k = 0; k < edges[j].length-1; k++) {
                //console.log(edges[j]);
                // each individual vertice in the list of edges
                let p0 = verticesList[edges[j][k]];
                let p1 = verticesList[edges[j][k+1]];

                let line = {pt0: p0, pt1: p1};
                let newLine = line;

                // todo add clipping here
                //newLine = clipLinePerspective(line, -1*(scene.view.clip[4]/scene.view.clip[5]));
                //newLine = clipLineParallel(line);
                if (newLine != null) {
                    //console.log("hello");
                    let p02d = Matrix.multiply([projectionMatrix, newLine.pt0]); // put V in here
                    let p12d = Matrix.multiply([projectionMatrix, newLine.pt1]); // put V in here
                    //console.log("K = " + k + " " + newLine);

                    p02d.x = p02d.x / p02d.w;
                    p12d.x = p12d.x / p12d.w;
                    p02d.y = p02d.y / p02d.w;
                    p12d.y = p12d.y / p12d.w;
                    drawLine((p02d.x + 1) * view.width/2, (p02d.y + 1) * view.height/2, (p12d.x + 1) * view.width/2, (p12d.y +1) * view.height/2);
                }
                
                

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
    let result = line;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodeParallel(p0);
    let out1 = outcodeParallel(p1);
    let x, y, z, t;
    let out;

    if (out0 == 0 && out1 == 0) {
        // trivial accept, entire edge is inside of bounds, no clipping needed
        //console.log("clipping if");
        return result;
    } else if ((out0 & out1) != 0) {
        // trivial deny, entire edge is outside of bounds, no clipping needed
        //console.log("clipping else if");
        return null;
    } else if ((out0 & out1) == 0 && out0 == 0 || out1 == 0) {
        //console.log("clipping else");
        // need to clip
        if (out0 != 0) {
            if (out0 & LEFT) {
                t = (-line.pt0.x + line.pt0.z) / (Math.abs(line.pt0.x - line.pt1.x) - Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.x;
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = scene.view.clip[0];
                result.pt0.x = x;
                result.pt0.y = y;
                result.pt0.z = z; 
                return line;
            } else if (out0 & RIGHT) {
                t = (line.pt0.x + line.pt0.z) / (-Math.abs(line.pt0.x - line.pt1.x) - Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.x;
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = scene.view.clip[1];
                result.pt0.x = x;
                result.pt0.y = y;
                result.pt0.z = z; 
                return result;
            } else if (out0 & BOTTOM) {
                t = (-line.pt0.y + line.pt0.z) / (Math.abs(line.pt0.y - line.pt1.y) - Math.abs(line.pt0.z - line.pt1.z));
                y = scene.view.clip[2];
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt0.x = x;
                result.pt0.y = y;
                result.pt0.z = z; 
                return result;
            } else if (out0 & TOP) {
                t = (line.pt0.y + line.pt0.z) / (-Math.abs(line.pt0.y - line.pt1.y) - Math.abs(line.pt0.z - line.pt1.z));
                y = scene.view.clip[3];
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt0.x = x;
                result.pt0.y = y;
                result.pt0.z = z; 
                return result;
            } else if (out0 & NEAR) {
                t = (line.pt0.z - z_min) / (-Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.y;;
                z = scene.view.clip[4];
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt0.x = x;
                result.pt0.y = y;
                result.pt0.z = z; 
                return result;
            } else if (out0 & FAR) {
                t = (-line.pt0.z - 1) / (Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.y;;
                z = scene.view.clip[5];
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt0.x = x;
                result.pt0.y = y;
                result.pt0.z = z; 
                return result;
            }
        }
        else if (out1 != 0) {
            if (out1 & LEFT) {
                t = (-line.pt0.x + line.pt0.z) / (Math.abs(line.pt0.x - line.pt1.x) - Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.x;
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = scene.view.clip[0];
                result.pt1.x = x;
                result.pt1.y = y;
                result.pt1.z = z; 
                return result;
            } else if (out1 & RIGHT) {
                t = (line.pt0.x + line.pt0.z) / (-Math.abs(line.pt0.x - line.pt1.x) - Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.x;
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = scene.view.clip[1];
                result.pt1.x = x;
                result.pt1.y = y;
                result.pt1.z = z;
                return result;
            } else if (out1 & BOTTOM) {
                t = (-line.pt0.y + line.pt0.z) / (Math.abs(line.pt0.y - line.pt1.y) - Math.abs(line.pt0.z - line.pt1.z));
                y = scene.view.clip[2];
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt1.x = x;
                result.pt1.y = y;
                result.pt1.z = z;
                return result;
            } else if (out1 & TOP) {
                t = (line.pt0.y + line.pt0.z) / (-Math.abs(line.pt0.y - line.pt1.y) - Math.abs(line.pt0.z - line.pt1.z));
                y = scene.view.clip[3];
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt1.x = x;
                result.pt1.y = y;
                result.pt1.z = z;
                return result;
            } else if (out1 & NEAR) {
                t = (line.pt0.z - z_min) / (-Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.y;;
                z = scene.view.clip[4];
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt1.x = x;
                result.pt1.y = y;
                result.pt1.z = z; 
                return result;
            } else if (out1 & FAR) {
                t = (-line.pt0.z - 1) / (Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.y;;
                z = scene.view.clip[5];
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt1.x = x;
                result.pt1.y = y;
                result.pt1.z = z;
                return result;
            }
        }
    }
    return result;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    let result = line;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);
    let x, y, z, t;

    if (out0 == 0 && out1 == 0) {
        // trivial accept, entire edge is inside of bounds, no clipping needed
       // console.log("clipping if");
        return result;
    } else if ((out0 & out1) != 0) {
        // trivial deny, entire edge is outside of bounds, no clipping needed
        //console.log("clipping else if");
        return null;
    } else if ((out0 & out1) == 0 && out0 == 0 || out1 == 0) {
        //console.log("clipping else");
        // need to clip
        if (out0 != 0) {
            if (out0 & LEFT) {
                t = (-1*(line.pt0.x) + line.pt0.z) / (Math.abs(line.pt0.x - line.pt1.x) - Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.y;
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = z;//scene.view.clip[0];
                result.pt0.x = x;
                result.pt0.y = y;
                result.pt0.z = z; 
                return line;
            } else if (out0 & RIGHT) {
                t = (line.pt0.x + line.pt0.z) / (-Math.abs(line.pt0.x - line.pt1.x) - Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.y;
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = -z;//scene.view.clip[1];
                result.pt0.x = x;
                result.pt0.y = y;
                result.pt0.z = z; 
                return result;
            } else if (out0 & BOTTOM) {
                t = (-line.pt0.y + line.pt0.z) / (Math.abs(line.pt0.y - line.pt1.y) - Math.abs(line.pt0.z - line.pt1.z));
                y = z;//scene.view.clip[2];
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt0.x = x;
                result.pt0.y = y;
                result.pt0.z = z; 
                return result;
            } else if (out0 & TOP) {
                t = (line.pt0.y + line.pt0.z) / (-Math.abs(line.pt0.y - line.pt1.y) - Math.abs(line.pt0.z - line.pt1.z));
                y = -z;//scene.view.clip[3];
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt0.x = x;
                result.pt0.y = y;
                result.pt0.z = z; 
                return result;
            } else if (out0 & NEAR) {
                t = (line.pt0.z - z_min) / (-Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.y;
                z = z_min;//scene.view.clip[4];
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt0.x = x;
                result.pt0.y = y;
                result.pt0.z = z; 
                return result;
            } else if (out0 & FAR) {
                t = (-line.pt0.z - 1) / (Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.y;;
                z = -1;//scene.view.clip[5];
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt0.x = x;
                result.pt0.y = y;
                result.pt0.z = z; 
                return result;
            }
        }
        else if (out1 != 0) {
            if (out1 & LEFT) {
                t = (-line.pt0.x + line.pt0.z) / (Math.abs(line.pt0.x - line.pt1.x) - Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.y;
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = z;//scene.view.clip[0];
                result.pt1.x = x;
                result.pt1.y = y;
                result.pt1.z = z; 
                return result;
            } else if (out1 & RIGHT) {
                t = (line.pt0.x + line.pt0.z) / (-Math.abs(line.pt0.x - line.pt1.x) - Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.y;
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = -z;//scene.view.clip[1];
                result.pt1.x = x;
                result.pt1.y = y;
                result.pt1.z = z;
                return result;
            } else if (out1 & BOTTOM) {
                t = (-line.pt0.y + line.pt0.z) / (Math.abs(line.pt0.y - line.pt1.y) - Math.abs(line.pt0.z - line.pt1.z));
                y = z;//scene.view.clip[2];
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt1.x = x;
                result.pt1.y = y;
                result.pt1.z = z;
                return result;
            } else if (out1 & TOP) {
                t = (line.pt0.y + line.pt0.z) / (-Math.abs(line.pt0.y - line.pt1.y) - Math.abs(line.pt0.z - line.pt1.z));
                y = -z;//scene.view.clip[3];
                z = (1-t) * line.pt0.z + t * line.pt1.z;
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt1.x = x;
                result.pt1.y = y;
                result.pt1.z = z;
                return result;
            } else if (out1 & NEAR) {
                t = (line.pt0.z - z_min) / (-Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.y;
                z = z_min;//scene.view.clip[4];
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt1.x = x;
                result.pt1.y = y;
                result.pt1.z = z; 
                return result;
            } else if (out1 & FAR) {
                t = (-line.pt0.z - 1) / (Math.abs(line.pt0.z - line.pt1.z));
                y = (1-t) * line.pt0.y + t * line.pt1.y;
                z = -1;//scene.view.clip[5];
                x = (1-t) * line.pt0.x + t * line.pt1.x;
                result.pt1.x = x;
                result.pt1.y = y;
                result.pt1.z = z;
                return result;
            }
        }
    }


    
    // TODO: implement clipping here!
    
    return result;
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
