/**
	Arrowhead Co. - Engine3D-vector.js

	>>> A custom library for vectors and vector utility functions.
	>>> Supports 3-dimensional vectors.
	>>> Works with matrix.js.
**/

	/*CONSTRUCTOR*/

function Vector(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;

	this.id = "vec";

	return this;
};

	/*PROTOTYPE METHODS*/

//Vector Arithmetic
Vector.prototype.add = function(vector){
	this.x += vector.x;
	this.y += vector.y;
	this.z += vector.z;

	return this;
};

Vector.prototype.sub = function(vector){
	this.x -= vector.x;
	this.y -= vector.y;
	this.z -= vector.z;

	return this;
};

Vector.prototype.mul = function(scalar){
	this.x *= scalar;
	this.y *= scalar;
	this.z *= scalar;

	return this;
};

Vector.prototype.div = function(scalar){
	this.x /= scalar;
	this.y /= scalar;
	this.z /= scalar;

	return this;
};

//Vector Magnitude
Vector.prototype.mag = function(){
	let x = this.x * this.x,
		y = this.y * this.y,
		z = this.z * this.z;

	return Math.pow(x + y + z, 0.5);
};

//Normalizing a Vector
Vector.prototype.norm = function(){
	this.div(this.mag());

	return this;
};

//With matrix
Vector.prototype.xMatrix = function(matrix){
	let self = new Vector(
		this.x,
		this.y,
		this.z);
	let w = 
		matrix.x[3] * self.x +
		matrix.y[3] * self.y +
		matrix.z[3] * self.z + 
		matrix.w[3] * 1;

	this.x = 
		matrix.x[0] * self.x + 
		matrix.y[0] * self.y + 
		matrix.z[0] * self.z + 
		matrix.w[0] * 1;

	this.y = 
		matrix.x[1] * self.x + 
		matrix.y[1] * self.y + 
		matrix.z[1] * self.z + 
		matrix.w[1] * 1;

	this.z = 
		matrix.x[2] * self.x + 
		matrix.y[2] * self.y + 
		matrix.z[2] * self.z + 
		matrix.w[2] * 1;

	this.div(w);

	return this;
};

	/*METHODS*/

//Vector arithmetic
Vector.add = function(vector1, vector2){
	let sum = new Vector(0, 0, 0);

	sum.x = vector1.x + vector2.x;
	sum.y = vector1.y + vector2.y;
	sum.z = vector1.z + vector2.z;

	return sum;
};

Vector.sub = function(vector1, vector2){
	let diff = new Vector(0, 0, 0);

	diff.x = vector1.x - vector2.x;
	diff.y = vector1.y - vector2.y;
	diff.z = vector1.z - vector2.z;

	return diff;
};

Vector.mul = function(vector, scalar){
	let prod = new Vector(0, 0, 0);

	prod.x = vector.x * scalar;
	prod.y = vector.y * scalar;
	prod.z = vector.z * scalar;

	return prod;
};

Vector.div = function(vector, scalar){
	let quo = new Vector(0, 0, 0);

	quo.x = vector.x / scalar;
	quo.y = vector.y / scalar;
	quo.z = vector.z / scalar;

	return quo;
};

//Normalizing a Vector
Vector.norm = function(vector){
	let normal = new Vector(
		vector.x,
		vector.y,
		vector.z);

	normal.norm();

	return normal;
};

//Dot and Cross Products
Vector.dot = function(vector1, vector2){
	let x = vector1.x * vector2.x,
		y = vector1.y * vector2.y,
		z = vector1.z * vector2.z;

	return x + y + z;
};

Vector.cross = function(vector1, vector2){
	let prod = new Vector(0, 0, 0);

	prod.x = 
		vector1.y * vector2.z - 
		vector1.z * vector2.y;
	prod.y = 
		vector1.z * vector2.x - 
		vector1.x * vector2.z;
	prod.z = 
		vector1.x * vector2.y - 
		vector1.y * vector2.x;

	return prod;
};

//Product with a matrix
Vector.xMatrix = function(vector, matrix){
	let prod = new Vector(0, 0, 0);
	let w = 
		matrix.x[3] * vector.x +
		matrix.y[3] * vector.y +
		matrix.z[3] * vector.z + 
		matrix.w[3] * 1;

	prod.x = 
		matrix.x[0] * vector.x + 
		matrix.y[0] * vector.y + 
		matrix.z[0] * vector.z + 
		matrix.w[0] * 1;

	prod.y = 
		matrix.x[1] * vector.x + 
		matrix.y[1] * vector.y + 
		matrix.z[1] * vector.z + 
		matrix.w[1] * 1;

	prod.z = 
		matrix.x[2] * vector.x + 
		matrix.y[2] * vector.y + 
		matrix.z[2] * vector.z + 
		matrix.w[2] * 1;

	prod.div(w);

	return prod;
};

//Plane intersection with vector
Vector.xPlane = function(point, normal, startVector, endVector){
	normal = Vector.norm(normal);

	let dist = 	Vector.dot(normal, point),

		start = Vector.dot(startVector, normal),
		end = 	Vector.dot(endVector, normal),

		vec = 	Vector.sub(endVector, startVector),
		arrow = Vector.mul(vec, (dist - start) / (end - start));

	return Vector.add(startVector, arrow);
};

//Copies a vector
Vector.copy = function(vector){
	let copy = new Vector(0, 0, 0);

	copy.x = vector.x;
	copy.y = vector.y;
	copy.z = vector.z;

	return copy;
};
