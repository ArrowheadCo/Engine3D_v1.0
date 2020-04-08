/**
	Arrowhead Co. - Engine3D-matrix.js

	>>> A custom library for matrices and matrix utility functions.
	>>> Contains a constructor for 4x4 matrices.
	>>> Works with vector.js.
**/

	/*CONSTRUCTOR*/

//4x4 Matrix Constructor
function Matrix(
	x0, x1, x2, x3,
	y0, y1, y2, y3,
	z0, z1, z2, z3,
	w0, w1, w2, w3){

	this.x = [x0, x1, x2, x3];
	this.y = [y0, y1, y2, y3];
	this.z = [z0, z1, z2, z3];
	this.w = [w0, w1, w2, w3];

	this.id = "mat";

	return this;
};

	/*PROTOTYPE METHODS*/

//Matrix x Matrix
Matrix.prototype.xMatrix = function(matrix){
	let self = new Matrix(
		this.x[0], this.x[1], this.x[2], this.x[3],
		this.y[0], this.y[1], this.y[2], this.y[3],
		this.z[0], this.z[1], this.z[2], this.z[3],
		this.w[0], this.w[1], this.w[2], this.w[3]);

	for(let i = 0; i < 4; i++){
		this.x[i] = 
			self.x[0] * matrix.x[i] + 
			self.x[1] * matrix.y[i] + 
			self.x[2] * matrix.z[i] + 
			self.x[3] * matrix.w[i]; 

		this.y[i] = 
			self.y[0] * matrix.x[i] + 
			self.y[1] * matrix.y[i] + 
			self.y[2] * matrix.z[i] + 
			self.y[3] * matrix.w[i];

		this.z[i] = 
			self.z[0] * matrix.x[i] + 
			self.z[1] * matrix.y[i] + 
			self.z[2] * matrix.z[i] + 
			self.z[3] * matrix.w[i];

		this.w[i] = 
			self.w[0] * matrix.x[i] + 
			self.w[1] * matrix.y[i] + 
			self.w[2] * matrix.z[i] + 
			self.w[3] * matrix.w[i]; 
	}

	return this;
};

	/*METHODS*/

//Matrix x Matrix
Matrix.xMatrix = function(matrix1, matrix2){
	let prod = new Matrix(
		0, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 0);

	for(let i = 0; i < 4; i++){
		prod.x[i] = 
			matrix1.x[0] * matrix2.x[i] + 
			matrix1.x[1] * matrix2.y[i] + 
			matrix1.x[2] * matrix2.z[i] + 
			matrix1.x[3] * matrix2.w[i]; 

		prod.y[i] = 
			matrix1.y[0] * matrix2.x[i] + 
			matrix1.y[1] * matrix2.y[i] + 
			matrix1.y[2] * matrix2.z[i] + 
			matrix1.y[3] * matrix2.w[i];

		prod.z[i] = 
			matrix1.z[0] * matrix2.x[i] + 
			matrix1.z[1] * matrix2.y[i] + 
			matrix1.z[2] * matrix2.z[i] + 
			matrix1.z[3] * matrix2.w[i];

		prod.w[i] = 
			matrix1.w[0] * matrix2.x[i] + 
			matrix1.w[1] * matrix2.y[i] + 
			matrix1.w[2] * matrix2.z[i] + 
			matrix1.w[3] * matrix2.w[i]; 
	}

	return prod;
};

	/*INSTANCES*/

//Pre-defined matrices
Matrix.identity = function(){
	let identity = new Matrix(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	);

	return identity;
};

//Projection matrix
Matrix.projection = function(ratio, fov, zMin, zMax){
	let projection = new Matrix(
		ratio / Math.tan(fov / 2), 0, 0, 0,
		0, 1 /  Math.tan(fov / 2), 0, 0,
		0, 0,  zMax / (zMax -  zMin), 1,
		0, 0, -zMin *  zMax / (zMax - zMin), 0);

	return projection;
};

//Rotation Matrices
Matrix.xRotation = function(angle){
	let rotation = new Matrix(
		1, 0, 0, 0,
		0,  Math.cos(angle), Math.sin(angle), 0,
		0, -Math.sin(angle), Math.cos(angle), 0,
		0, 0, 0, 1);

	return rotation;
};

Matrix.yRotation = function(angle){
	let rotation = new Matrix(
		 Math.cos(angle), 0, Math.sin(angle), 0,
		0, 1, 0, 0,
	    -Math.sin(angle), 0, Math.cos(angle), 0,
		0, 0, 0, 1
		);

	return rotation;
};

Matrix.zRotation = function(angle){
	let rotation = new Matrix(
		 Math.cos(angle), Math.sin(angle), 0, 0,
		-Math.sin(angle), Math.cos(angle), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1);

	return rotation;
};

//Translation matrix
Matrix.translate = function(tx, ty, tz){
	let translation = new Matrix(
		1,  0,  0,  0,
		0,  1,  0,  0,
		0,  0,  1,  0,
		tx, ty, tz, 1);

	return translation;
};

//View matrix
Matrix.view = function(camera, direction, north){
	let newF = Vector.norm(direction),
		newU = Vector.sub(north,
			   Vector.mul(newF,
			   Vector.dot(north, newF))).norm(),
		newR = Vector.cross(newU, newF);

	let view = new Matrix(
		newR.x, newU.x, newF.x, 0,
		newR.y, newU.y, newF.y, 0,
		newR.z, newU.z, newF.z, 0,
		-Vector.dot(camera, newR),
		-Vector.dot(camera, newU),
		-Vector.dot(camera, newF), 1);

	return view;
};

	/*GLOBALS*/

var IDENTITY = Matrix.identity();
