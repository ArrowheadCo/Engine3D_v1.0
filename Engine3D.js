/**
	Arrowhead Co. - Engine3D.js

	>>> Runs the 3D engine.
	>>> Performs graphics stuff.
**/

	/*GLOBALS*/

var Engine3D = {
	primitives : [],
};

	/*METHODS*/

//Engine
Engine3D.revert = function(){

	//Resets scene
	this.primitives = [];
}

Engine3D.create = function(){
	let Color =    color(255),	
		darkMode = true,

		Basis =  new Vector(0, 0, 0),
		Rot =    new Vector(0, 0, 0),
		Center = new Vector(0, 0, 0),
		
		prims = arguments.length;

	darkMode = arguments[--prims];
	Rot =      arguments[--prims];
	Color =    arguments[--prims];
	Center =   arguments[--prims];

	if(!darkMode){
		console.log(darkMode);
	}

	//Adds object to primitives array
	for(let i = 0; i < prims; i++){
		arguments[i].color =    Color;
		arguments[i].center =   Center;
		arguments[i].rotation = Rot;
		arguments[i].darkMode = darkMode;

		this.primitives.push(arguments[i]);
	}

	return this;
};

Engine3D.update = function(){
	for(let i = 0; i < this.primitives.length; i++){
		for(let j = 0; j < 
			this.primitives[i].vectors.length; j++){
			this.primitives[i].vectors[j].
				xMatrix(
					Matrix.translate(
						-this.primitives[i].center.x,
						-this.primitives[i].center.y,
						-this.primitives[i].center.z)).
				xMatrix(
					Matrix.zRotation(
						this.primitives[i].rotation.z)).
				xMatrix(
					Matrix.yRotation(
						this.primitives[i].rotation.y)).
				xMatrix(
					Matrix.xRotation(
						this.primitives[i].rotation.x)).
				xMatrix(
					Matrix.translate(
						this.primitives[i].center.x,
						this.primitives[i].center.y,
						this.primitives[i].center.z));
		}
	}	
};

Engine3D.view = function(){
	this.visiblePrimitives = [];

	//Transformations based on camera
	for(let i = 0; i < 
		this.primitives.length; i++){

		//Normal used for shading
		this.primitives[i].normal = 
					Vector.cross(
					Vector.sub(this.primitives[i].vectors[1],
							   this.primitives[i].vectors[0]),
					Vector.sub(this.primitives[i].vectors[2],
					 		   this.primitives[i].vectors[0])).norm();

		//If primitive can be seen
		if(Vector.dot( 
		   Vector.sub(
		   Vector.copy(
		   		this.primitives[i].vectors[0]),
		   			Camera.pos), 
		   		this.primitives[i].normal) < 0 ||
		   alpha(
		   		this.primitives[i].color) < 255){
			
			this.primitives[i].projectedVectors = [];

			//Ensures original vector info are not lost
			for(let j = 0; j < 
				this.primitives[i].vectors.length; j++){
				this.primitives[i].projectedVectors[j] = 
					Vector.xMatrix(
					Vector.copy(this.primitives[i].vectors[j]),
					Matrix.view(Camera.pos, 
								Camera.dir, 
								Camera.nor)
				);
			}

			this.visiblePrimitives.push(this.primitives[i]);
		}
	}

	return this;
};

Engine3D.clip3D = function(){
	let primitiveCount = 
		this.visiblePrimitives.length;
		this.clipped3DPrimitives = [];

	//Clips against zMin plane
	for(let i = 0; i < primitiveCount; i++){
		let currentPrimitive = this.visiblePrimitives[i],

			point =  Camera.zMinPlane[0],
			normal = Camera.zMinPlane[1],

			inside =  [],
			outside = [];

		//Checks whether each vector (point) is inside of plane
		for(let j = 0; j < currentPrimitive.projectedVectors.length; j++){
			if(Vector.dot(currentPrimitive.projectedVectors[j], normal) - 
			   Vector.dot(point, normal) >= 0){
				inside.push({
					primitive : currentPrimitive.
								projectedVectors[j],
					index : j
				});
			} else {
				outside.push({
					primitive : currentPrimitive.
								projectedVectors[j],
					index : j
				});
				
			}
		}

		let clippedPrimitive = new Primitive();

		clippedPrimitive.projectedVectors = [];
		clippedPrimitive.darkMode = currentPrimitive.darkMode;
		clippedPrimitive.normal =   currentPrimitive.normal;
		clippedPrimitive.center =   currentPrimitive.center;
		clippedPrimitive.color =    currentPrimitive.color;

		//Checks the conditions and does something based on them
		if(outside.length === 0){

			//Entire primitive is inside
			this.clipped3DPrimitives.push(currentPrimitive);

			continue;
		} else if(inside.length === 1){

			//Merely a triangle is formed
			clippedPrimitive.projectedVectors.push(
				Vector.xPlane(point, normal, inside[0].primitive,
					currentPrimitive.projectedVectors[(inside[0].index - 1 + 
					currentPrimitive.projectedVectors.length) % 
					currentPrimitive.projectedVectors.length]));
			clippedPrimitive.projectedVectors.push(inside[0].primitive);
			clippedPrimitive.projectedVectors.push(
				Vector.xPlane(point, normal, inside[0].primitive,
					currentPrimitive.projectedVectors[(inside[0].index + 1) % 
					currentPrimitive.projectedVectors.length]));
		} else if(outside.length === 1){
			
			//Loops through original points; includes those inside and creates two new points
			for(let k = 0; k < currentPrimitive.projectedVectors.length; k++){
				if(k !== outside[0].index){
					clippedPrimitive.projectedVectors.push(
						currentPrimitive.projectedVectors[k]);
				} else {

					//Two new points
					clippedPrimitive.projectedVectors.push(
						Vector.xPlane(point, normal,
							currentPrimitive.projectedVectors[(k - 1 + 
							currentPrimitive.projectedVectors.length) % 
							currentPrimitive.projectedVectors.length],
							outside[0].primitive));
					clippedPrimitive.projectedVectors.push(
						Vector.xPlane(point, normal,
							currentPrimitive.projectedVectors[(k + 1) % 
							currentPrimitive.projectedVectors.length],
							outside[0].primitive));
				}
			}
		} else if(inside.length === 0){

			//Nothing happens because the entire primitive is outside
			continue;
		} else {
			let minIn, minOut,
				maxIn, maxOut,

				notInside = true;

			//The pairs of points whose adjacents are on the other side
			for(let k = 0; k < inside.length; k++){
				if(inside[k].index === 0){
					minOut = outside[0].index;
					maxOut = outside[outside.length - 1].index;

					minIn = (maxOut + 1) % 
						currentPrimitive.projectedVectors.length;
					maxIn = (minOut - 1 + 
						currentPrimitive.projectedVectors.length) %
						currentPrimitive.projectedVectors.length;

					notInside = false;

					break;
				}
			}

			if(notInside){
				minIn = inside[0].index;
				maxIn = inside[inside.length - 1].index;

				minOut = (maxIn + 1) %
					currentPrimitive.projectedVectors.length;
				maxOut = (minIn - 1 + 
					currentPrimitive.projectedVectors.length) %
					currentPrimitive.projectedVectors.length;
			}

			//Adds inside points, as well as two new ones
			for(let k = 0; k < inside.length; k++){
				if(inside[k].index === minIn){
					
					//First new point
					clippedPrimitive.projectedVectors.push(
						Vector.xPlane(point, normal,
							currentPrimitive.projectedVectors[minIn],
							currentPrimitive.projectedVectors[maxOut]));
					//One of the original points
					clippedPrimitive.projectedVectors.push(
						currentPrimitive.projectedVectors[inside[k].index]);
				} else if(inside[k].index === maxIn){

					//One of the original points
					clippedPrimitive.projectedVectors.push(
						currentPrimitive.projectedVectors[inside[k].index]);
					
					//Second new point
					clippedPrimitive.projectedVectors.push(
						Vector.xPlane(point, normal,
							currentPrimitive.projectedVectors[maxIn],
							currentPrimitive.projectedVectors[minOut]));
				} else {

					//Original points
					clippedPrimitive.projectedVectors.push(
						currentPrimitive.projectedVectors[inside[k].index]);
				}
			}
		}

		this.clipped3DPrimitives.push(clippedPrimitive);
	}

	return this;
};

Engine3D.project = function(){

	//Projects each primitive
	for(let i = 0; i < this.clipped3DPrimitives.length; i++){

		//Projects each vector of each primitive
		for(let j = 0; j < 
			this.clipped3DPrimitives[i].projectedVectors.length; j++){
			this.clipped3DPrimitives[i].projectedVectors[j].xMatrix(
				Matrix.projection(
					Camera.aspectRatio,
					Camera.fieldOfView,
					Camera.zMin,
					Camera.zMax
				)
			);

			//Re-scales beacuse projected version is normalized
			this.clipped3DPrimitives[i].projectedVectors[j].x *= width;
			this.clipped3DPrimitives[i].projectedVectors[j].x += width / 2;

			this.clipped3DPrimitives[i].projectedVectors[j].y *= height;
			this.clipped3DPrimitives[i].projectedVectors[j].y += height / 2;
		}

		//Computes shade based on light direction (if it hasn't)
		if(!this.clipped3DPrimitives[i].shade){
			if(this.clipped3DPrimitives[i].darkMode){
			   this.clipped3DPrimitives[i].shade = dim(
			   this.clipped3DPrimitives[i].color, 1 - 
					(Vector.dot(
					 Vector.norm(
					 Vector.mul(Light.dir, -1)), 
						this.clipped3DPrimitives[i].normal) + 1) / 2.5);
			} else {
				this.clipped3DPrimitives[i].shade = lit(
				this.clipped3DPrimitives[i].color, 0.4 - 
					(Vector.dot(
					 Vector.norm(
					 Vector.mul(Light.dir, 1)), 
						this.clipped3DPrimitives[i].normal) + 1) / 2.5);
			}
		}
	}

	return this;
};

Engine3D.order = function(){

	//Sorts primitives based on z
	this.clipped3DPrimitives.sort(function(a, b){
		let bDepth = 0,
			aDepth = 0,

			bCenter = 0,
			aCenter = 0;

		//Uses their midpoints for reference
		for(let i = 0; i < b.vectors.length; i++){
			bDepth = Math.max(bDepth,
				 	 Vector.sub(b.vectors[i],
				 	 Camera.pos).mag());
		}
		for(let i = 0; i < a.vectors.length; i++){
			aDepth = Math.max(aDepth,
				 	 Vector.sub(a.vectors[i],
				 	 Camera.pos).mag());
		}

		bCenter = Vector.sub(b.center, Camera.pos).mag();
		aCenter = Vector.sub(a.center, Camera.pos).mag();

		return (bDepth - aDepth) || (bCenter - aCenter);
	});

	return this;
};

Engine3D.clip2D = function(){
	let	primitiveCount = this.clipped3DPrimitives.length;

	this.clipped2DPrimitives = this.clipped3DPrimitives;

	//Clips all primitives against each of the side planes
	for(let i = 0; i < primitiveCount; i++){
		let subsetPrimitives = [this.clipped2DPrimitives[0]],
			nextSubset = [],
			toClip = 1;

		this.clipped2DPrimitives.shift();

		//For each plane
		for(let j = 0; j < Camera.planes.length; j++){
			let point =  Camera.planes[j][0],
				normal = Camera.planes[j][1];

			//If there are primitives to clip
			for(let k = 0; k < toClip; k++){
				let inside =  [],
					outside = [];

				//For each projected vector of the current primitive, determine if in or out
				for(let l = 0; l < subsetPrimitives[k].projectedVectors.length; l++){
					if(Vector.dot(subsetPrimitives[k].projectedVectors[l], normal) - 
					   Vector.dot(point, normal) >= 0){
						inside.push({
							primitive : subsetPrimitives[k].
										projectedVectors[l],
							index : l
						});
					} else {
						outside.push({
							primitive : subsetPrimitives[k].
										projectedVectors[l],
							index : l
						});
					}
				}

				let clippedPrimitive = new Primitive();

				clippedPrimitive.projectedVectors = [];
				clippedPrimitive.shade = subsetPrimitives[k].shade;

				//Based on conditions, it clips the primitive
				if(outside.length === 0){

					//The entire primitive is within this plane
					nextSubset.push(subsetPrimitives[k]);

					continue;
				} else if(inside.length === 1){

					//A new triangle is created from the original primitive
					clippedPrimitive.projectedVectors.push(
						Vector.xPlane(point, normal, inside[0].primitive,
							subsetPrimitives[k].projectedVectors[(inside[0].index - 1 + 
							subsetPrimitives[k].projectedVectors.length) % 
							subsetPrimitives[k].projectedVectors.length]));
					clippedPrimitive.projectedVectors.push(inside[0].primitive);
					clippedPrimitive.projectedVectors.push(
						Vector.xPlane(point, normal, inside[0].primitive,
							subsetPrimitives[k].projectedVectors[(inside[0].index + 1) % 
							subsetPrimitives[k].projectedVectors.length]));
				} else if(outside.length === 1){

					//Adds all inside points and two new ones
					for(let l = 0; l < subsetPrimitives[k].projectedVectors.length; l++){
						if(l !== outside[0].index){
							clippedPrimitive.projectedVectors.push(
								subsetPrimitives[k].projectedVectors[l]);
						} else {
							
							//Two new points
							clippedPrimitive.projectedVectors.push(
								Vector.xPlane(point, normal, 
									subsetPrimitives[k].projectedVectors[(l - 1 + 
									subsetPrimitives[k].projectedVectors.length) % 
									subsetPrimitives[k].projectedVectors.length],
									outside[0].primitive));
							clippedPrimitive.projectedVectors.push(
								Vector.xPlane(point, normal, 
									subsetPrimitives[k].projectedVectors[(l + 1) % 
									subsetPrimitives[k].projectedVectors.length], 
									outside[0].primitive));
						}
					}
				} else if(inside.length === 0){

					//Nothing happens because it is completely outside this plane
					continue;
				} else {
					let minIn, minOut,
						maxIn, maxOut,

						notInside = true;

					//The pairs of points whose adjacents are on the other side
					for(let l = 0; l < inside.length; l++){
						if(inside[l].index === 0){
							minOut = outside[0].index;
							maxOut = outside[outside.length - 1].index;

							minIn = (maxOut + 1) % 
								subsetPrimitives[k].projectedVectors.length;
							maxIn = (minOut - 1 + 
								subsetPrimitives[k].projectedVectors.length) % 
								subsetPrimitives[k].projectedVectors.length;

							notInside = false;

							break;
						}
					}

					if(notInside){
						minIn = inside[0].index;
						maxIn = inside[inside.length - 1].index;

						minOut = (maxIn + 1) % 
							subsetPrimitives[k].projectedVectors.length;
						maxOut = (minIn - 1 + 
							subsetPrimitives[k].projectedVectors.length) %
							subsetPrimitives[k].projectedVectors.length;
					}

					//Add all inside points and two new ones
					for(let l = 0; l < inside.length; l++){
						if(inside[l].index === minIn){
							
							//First new point
							clippedPrimitive.projectedVectors.push(
								Vector.xPlane(point, normal, 
									subsetPrimitives[k].projectedVectors[minIn], 
									subsetPrimitives[k].projectedVectors[maxOut]));
							
							//One of the old points
							clippedPrimitive.projectedVectors.push(
								subsetPrimitives[k].projectedVectors[inside[l].index]);
						} else if(inside[l].index === maxIn){
							
							//One of the old points
							clippedPrimitive.projectedVectors.push(
								subsetPrimitives[k].projectedVectors[inside[l].index]);
							
							//Second new point
							clippedPrimitive.projectedVectors.push(
								Vector.xPlane(point, normal, 
									subsetPrimitives[k].projectedVectors[maxIn], 
									subsetPrimitives[k].projectedVectors[minOut]));
						} else {
							
							//Original points
							clippedPrimitive.projectedVectors.push(
								subsetPrimitives[k].projectedVectors[inside[l].index]);
						}
					}
				}

				nextSubset.push(clippedPrimitive);
			}

			subsetPrimitives = [];
			toClip = nextSubset.length;

			//Adds new primitives for evaluation on next plane
			for(let k = 0; k < nextSubset.length; k++){
				subsetPrimitives[k] = nextSubset[k];
			}

			nextSubset = [];

			//If that was actually the last plane
			if(j === Camera.planes.length - 1){
				for(let k = 0; k < subsetPrimitives.length; k++){
					this.clipped2DPrimitives.push(
						 subsetPrimitives[k]);
				}
			}
		}
	}
	
	return this;
};

Engine3D.display = function(){
	//Display primitives
	for(let i = 0; i < this.clipped2DPrimitives.length; i++){
		let points = [];

		//For each vector
		for(let j = 0; j < this.clipped2DPrimitives[i].
								projectedVectors.length; j++){

			points.push(this.clipped2DPrimitives[i].
							 projectedVectors[j].x);
			points.push(this.clipped2DPrimitives[i].
							 projectedVectors[j].y);
		}

		//In case shade is undefined
		if(this.clipped2DPrimitives[i].shade){
			fill(  this.clipped2DPrimitives[i].shade);

			if(alpha(this.clipped2DPrimitives[i].shade) < 255){
					 this.clipped2DPrimitives[i].shade = [
					red(  this.clipped2DPrimitives[i].shade),
					green(this.clipped2DPrimitives[i].shade),
					blue( this.clipped2DPrimitives[i].shade),
					alpha(this.clipped2DPrimitives[i].shade) / 2,
				];
			}

			stroke(this.clipped2DPrimitives[i].shade);
		} else {
			noFill();
			noStroke();
		}

		poly(points);
	}

	return this;
};

Engine3D.render = function(){

	//Renders entire scene
	this.update();
	this.view();
	this.clip3D();
	this.project();
	this.order();
	this.clip2D();
	this.display();
};