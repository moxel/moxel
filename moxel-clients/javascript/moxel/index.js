const fileType = require('file-type');
if(typeof(window) != 'undefined' && !window.Buffer) {
	// Browser environment.
	window.Buffer = require('buffer')
}else{
	// Node.js environment.
	require('es6-promise').polyfill();
	require('isomorphic-fetch');
}
const Jimp = require('jimp');
const async = require('async');


var Moxel = function(config) {

	if(!config || !config.endpoint) {
		var MOXEL_ENDPOINT = 'http://beta.moxel.ai';
	}else{
		var MOXEL_ENDPOINT = config.endpoint
	}

	// var API_ENDPOINT = MOXEL_ENDPOINT + '/api';
	var API_ENDPOINT = '/api'; // TODO: CORS for APIs.
	var MODEL_ENDPOINT = MOXEL_ENDPOINT + '/model';	

	class Image {
		// img is Jimp image.
		constructor(img) {
			this.img = img;
			this.img.rgba(false); // use RGB only.
			this.shape = this.shape.bind(this);
			this.toBytes = this.toBytes.bind(this);
			this.toBase64 = this.toBase64.bind(this);
			this.toDataURL = this.toDataURL.bind(this);
		}

		// get shape of the image.
		shape() {
			return [
				this.img.bitmap.height,
				this.img.bitmap.width
			];
		}

		// Get RGB value of a pixel.
		rgb(i, j) {
			throw "Not implemented";
		}

		// Create Image object from raw binary data.
		static fromBytes(data) {
			// verify image type.
			var mime = fileType(data).mime;
			
		    // convert to dataURL.
	        var hasLoaded = false;
	        var result = {};

	        if(data instanceof ArrayBuffer) { // Convert to node buffer.
	        	data = new Buffer( new Uint8Array(data));
	        }

	        return new Promise((resolve, reject) => {
	        	Jimp.read(data).then((result) => {
	        		resolve(new Image(result));
	        	});
	        });
		}

		// Create Image object from raw base64 data.
		static fromBase64(data) {
			var buffer = Buffer.from(data, 'base64');
			return Image.fromBytes(buffer);
		}

		// Convert to bytes.
		// mime: default is png.
		toBytes(mime) {
			if(!mime) {
				mime = 'image/png';
			}
			return new Promise((resolve, reject) => {
				this.img.getBuffer(mime, (err, data) => {
					resolve(data);
				});
			})
		}

		// Convert to base64 encoding.
		// mime: default is png.
		toDataURL(mime) {
			if(!mime) {
				mime = 'image/png';
			}
			var self = this;
			return new Promise((resolve, reject) => {
				self.toBase64(mime).then((data) => {
					resolve('data:' + mime + ';base64,' + data);
				})
			})
		}

		// Convert to base64 encoding.
		// mime: default is png.
		toBase64(mime) {
			if(!mime) {
				mime = 'image/png';
			}
			var self = this;
			return new Promise((resolve, reject) => {
				self.toBytes(mime).then((data) => {
					resolve(Buffer(data).toString('base64'));
				})
			})
		}
	}

	// define submodule space.
	var space = {
		Image: Image,
	};

	class Utils {
		static parseModelId(modelId) {
			var parts = modelId.split(':');
			if(parts.length != 2) {
				throw 'Ill-formated modelId: ' + modelId;
			}
			var tag = parts[1];

			parts = parts[0].split('/');
			if(parts.length != 2) {
				throw 'Ill-formated modelId: ' + modelId;
			}

			var user = parts[0];
			var model = parts[1];

			return {
				user: user,
				model: model,
				tag: tag
			}
		}

		static parseSpaceObject(spaceObject) {
			var result = {};

			for(var k in spaceObject) {
				var v = spaceObject[k];
				if(!space[v]) {
					throw 'Type ' + v + ' is unknown.'
				}
				result[k] = space[v];
			}

			return result;
		}
	}

	class Model {
		constructor(user, name, tag, result) {
			this.user = user;
			this.name = name;
			this.tag = tag;
			this.metadata = result.metadata;
			this.status = result.status;
			this.inputSpace = this.metadata['input_space'];
			this.outputSpace = this.metadata['output_space'];

			this.predict = this.predict.bind(this);			
		}

		predict(kwargs) {
			var self = this;
			return new Promise(function(resolve, reject) {
				// Wrap input.
				var inputObject = {};

				new Promise((resolve, reject) => {
					async.forEachOf(self.inputSpace,
						(varSpace, varName, callback) => {
							// Assume base64 encoding.
							// Only works for Image now.
							if(!kwargs[varName]) {
								throw 'Input must have argument ' + varName;
							}
							// console.log(kwargs[varName]);
							kwargs[varName].toBase64('image/png').then((inputItem) => {
								inputObject[varName] = inputItem;
								callback();	
							});
						},

						(err) => {
							if(err) {
								reject(err);
							}else{
								resolve();
							}
						}
					)	
				}).then(() => {
					console.log(inputObject);
					// Make HTTP REST request.
					return fetch(MODEL_ENDPOINT + '/' + self.user + '/' + self.name + '/' + self.tag,
						{
							method: 'POST',
							headers: new Headers({
	                        	'Content-Type': 'application/json'
	                    	}),
	                    	body: JSON.stringify(inputObject)
	                    }
					)	
				}).then((response) => {
					return response.json();
				}).then((result) => {
					// Parse result.
					var outputObject = {};

					return new Promise((resolve, reject) => {
						async.forEachOf(self.outputSpace,
						(varSpace, varName, callback) => {
							Image.fromBase64(result[varName]).then((outputItem) => {
								outputObject[varName] = outputItem;
								callback();
							});							
						},
						(err) => {
							if(err) {
								reject(err);
							}else{
								resolve(outputObject);
							}
						})
					});
				}).then((outputObject) => {
					resolve(outputObject);	
				});	
			});
		}
	}

	function createModel(modelId) {
		return new Promise(function(resolve, reject) {
			var parts = Utils.parseModelId(modelId);
			var user = parts.user;
			var name = parts.model;
			var tag = parts.tag;

			fetch(API_ENDPOINT + '/users/' + user + '/models/' + name + '/' + tag).then(function(response) {
				return response.json();
			}).then(function(result) {
				var model = new Model(user, name, tag, result);
				if(model.status == 'LIVE') {
					resolve(model);
				}else{
					reject('The model must be in LIVE state');
				}
			})
		});
	}	

	return {
		space: space,
		createModel: createModel
	}
};

module.exports = Moxel;