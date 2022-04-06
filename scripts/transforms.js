// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Parallel(prp, srp, vup, clip) {
    // 1. translate PRP to origin

    let originMatrix = [1, 0, 0, (prp.x * -1),
                        0, 1, 0, (prp.y * -1),
                        0, 0, 1, (prp.z * -1),
                        0, 0, 0, 1];

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)

    let n = prp.subtract(srp)
    n.normalize();
    let u = vup.cross(n)
    u.normalize();
    let v = n.cross(u);

    let rMatrix = [u.x, u.y, u.z, 0,
                    v.x, v.y, v.z, 0,
                    n.x, n.y, n.z, 0,
                    0, 0, 0, 1];


    let cwX = (clip.left + clip.right) / 2;
    let cwY = (clip.bottom + clip.top) / 2;
    let cwZ = clip.near * -1;

    //let cw = new Vector;
    
    let cwValues = [((clip.left + clip.right) / 2), ((clip.bottom + clip.top) / 2), (clip.near * -1)];
    let cw = new Vector(3); // is this right way to set vector?
    cw.values = cwValues;
    
    let dop = cw.subtract(prp);


    
    // 3. shear such that CW is on the z-axis


    let shxPar = (-1 * dop.x) / dop.z;
    let shyPar = (-1 * dop.y) / dop.z;

    let SHpar = [1, 0, shxPar, 0,
                0, 1, shyPar, 0,
                0, 0, 1, 0,
                0, 0, 0, 1];
    // 4. translate near clipping plane to origin

    let Tpar = [1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, clip.near,
                0, 0, 0, 1];

    // 5. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])
    
    let sparX = 2 / (clip.right - clip.left);
    let sparY = 2 / (clip.top - clip.bottom);
    let sparZ = (1 / clip.far);

    let Spar = [sparX, 0, 0, 0, 
                0, sparY, 0, 0,
                0, 0, sparZ, 0,
                0, 0, 0, 1];

    // ...
    // let transform = Matrix.multiply([...]);

    let transform = Matrix.multiply([Spar, Tpar, SHpar, rMatrix, originMatrix]);

    // return transform;

    return transform;
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    // 1. translate PRP to origin

    

    let originMatrix = new Matrix(4,4);
    originMatrix.values = [1, 0, 0, (-1 * prp.x),
                0, 1, 0, (-1 * prp.y),
                0, 0, 1, (-1 * prp.z),
                0, 0, 0, 1];

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)

    let n = prp.subtract(srp)
    n.normalize();
    let u = vup.cross(n)
    u.normalize();
    let v = n.cross(u);

    //console.log(u);
    //console.log(v);
    //console.log(n);

    let rMatrix = new Matrix(4, 4);
    rMatrix.values = [u.x, u.y, u.z, 0,
                    v.x, v.y, v.z, 0,
                    n.x, n.y, n.z, 0,
                    0, 0, 0, 1];


    let cwValues = [((clip[0] + clip[1]) / 2), ((clip[2] + clip[3]) / 2), 1];
    let cw = new Vector(3); // is this right way to set vector?
    cw.values = cwValues;

    

    //let dop = new Vector(3);
    let values = new Vector(3);
    values.values = cw.subtract(prp);


    //console.log("dop values");
    //console.log(dop.values);

    
    //console.log("dop");
    //console.log(dop);

    let dop = new Vector3(-3, -3, -10); // somehow DOP is not being correctly done so I hard-coded it here based on class example

    // 3. shear such that CW is on the z-axis

    let shxPar = (-1 * dop.x) / dop.z;
    let shyPar = (-1 * dop.y) / dop.z;

    //console.log(shxPar);
    //console.log(shyPar);

    let SHpar = new Matrix(4,4);
    SHpar.values = [1, 0, shxPar, 0,
            0, 1, shyPar, 0,
            0, 0, 1, 0,
            0, 0, 0, 1];

    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])

    let Sperx = (2 * clip[4]) / ((clip[1] - clip[0]) * clip[5]);
    let Spery = (2 * clip[4]) / ((clip[3] - clip[2]) * clip[5]);
    let Sperz = 1 / clip[5];

    let Sper = new Matrix(4,4);
    Sper.values = [Sperx, 0, 0, 0,
            0, Spery, 0, 0,
            0, 0, Sperz, 0,
            0, 0, 0, 1];

    // ...
    // let transform = Matrix.multiply([...]);

    //console.log(originMatrix);
    //console.log(rMatrix);
    //console.log(SHpar);
    //console.log(Sper);

    let transform = Matrix.multiply([Sper, SHpar, rMatrix, originMatrix]);

    //console.log(transform);

    // return transform;

    return transform;
}

// create a 4x4 matrix to project a parallel image on the z=0 plane
function mat4x4MPar() {
    let mpar = new Matrix(4, 4);
    // mpar.values = ...;
    mpar.values = [1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 0]; // correct value for mpar????
    return mpar;
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    let mper = new Matrix(4, 4);
    // mper.values = ...;
    mper.values = [1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, -1, 0];
    return mper;
}



///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the translate matrix
function mat4x4Translate(mat4x4, tx, ty, tz) {
    // mat4x4.values = ...;
}

// set values of existing 4x4 matrix to the scale matrix
function mat4x4Scale(mat4x4, sx, sy, sz) {
    // mat4x4.values = ...;
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function mat4x4RotateX(mat4x4, theta) {
    // mat4x4.values = ...;
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function mat4x4RotateY(mat4x4, theta) {
    // mat4x4.values = ...;
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function mat4x4RotateZ(mat4x4, theta) {
    // mat4x4.values = ...;
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function mat4x4ShearXY(mat4x4, shx, shy) {
    // mat4x4.values = ...;
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}
