/**
	Arrowhead Co. - Camera3D.js

	>>> Creates a camera that is used by the 3D Engine.
	>>> Also includes light source.
	>>> FPS-style camera implementation.
**/

	/*GLOBALS*/

var Camera = {

	pos : new Vector(0, 0, 0),
	dir : new Vector(0, 0, 1),
	nor : new Vector(0, 1, 0),

	yaw : 0,
	pitch : 0,

	zMax : 10000,
	zMin : 0.1,

	fieldOfView : Math.PI / 2,
	aspectRatio : height / width,

	zMinPlane : [
		new Vector(0, 0, 0.1),
		new Vector(0, 0, 1)
	],

	planes : [
		[new Vector(0, 0, 0),			
		 new Vector(0, 1, 0)],

		[new Vector(0, height - 1, 0),
		 new Vector(0, -1, 0)],
		
		[new Vector(0, 0, 0), 			
		 new Vector(1, 0, 0)],
		
		[new Vector(width - 1, 0, 0), 	
		 new Vector(-1, 0, 0)],
	],
};

var Light = {
	dir : new Vector(-1, 2, 0),
};

	/*METHODS*/

//Light
Light.update = function(){
	this.dir.norm();
};

Light.set = function(direction){
	this.dir = direction;
};

//Camera
Camera.update = function(){

	//In case screen resizes
	this.aspectRatio = height / width;

	//Resetting
	this.dir = new Vector(0, 0, 1);
	this.nor = new Vector(0, 1, 0);

	this.pitch = Math.min(
				 Math.max(this.pitch, -Math.PI / 2.1),	
				 					   Math.PI / 2.1);

	//Movements
	this.dir.xMatrix(
			 Matrix.xRotation(this.pitch)
	);
	this.dir.xMatrix(
			 Matrix.yRotation(this.yaw)
	);
};

Camera.FPSfollow = function(object){
	this.pos = new Vector(
		object.x,
		object.y,
		object.z);

	this.fieldOfView = object.fov;
	this.yaw =   	   object.yaw;
	this.pitch = 	   object.pitch;
};

Camera.TPSfollow = function(object){
	
};