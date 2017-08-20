const fileType = require('file-type');
const Jimp = require("jimp");
const deasync = require('deasync');
require('es6-promise').polyfill();
require('isomorphic-fetch');

module.exports = function(config) {
	if(!config || !config.endpoint) {
		MOXEL_ENDPOINT = 'http://beta.moxel.ai';
	}else{
		MOXEL_ENDPOINT = config.endpoint
	}

	API_ENDPOINT = MOXEL_ENDPOINT + '/api';
	MODEL_ENDPOINT = MOXEL_ENDPOINT + '/model';

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

	        var read = deasync(Jimp.read);
		    return new Image(read(data));
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
			return deasync(this.img.getBuffer).bind(this.img)(mime)
		}

		// Convert to base64 encoding.
		// mime: default is png.
		toDataURL(mime) {
			if(!mime) {
				mime = 'image/png';
			}
			return 'data:' + mime + ';base64,' + this.toBase64(mime);
		}

		// Convert to base64 encoding.
		// mime: default is png.
		toBase64(mime) {
			if(!mime) {
				mime = 'image/png';
			}
			var bytes = this.toBytes(mime);
			return Buffer(bytes).toString('base64');
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
				for(var varName in self.inputSpace) {
					var varSpace = self.inputSpace[varName];

					// Assume base64 encoding.
					// Only works for Image now.
					if(!kwargs[varName]) {
						throw 'Input must have argument ' + varName;
					}
					var inputItem = kwargs[varName].toBase64('image/png');
					inputObject[varName] = inputItem;
				}

				// Make HTTP REST request.
				fetch(MODEL_ENDPOINT + '/' + self.user + '/' + self.name + '/' + self.tag,
					{
						method: 'POST',
						headers: new Headers({
                        	'Content-Type': 'application/json'
                    	}),
                    	body: JSON.stringify(inputObject)
                    }
				).then((response) => {
					return response.json();
				}).then((result) => {
					// Parse result.
					var outputObject = {};

					for(var varName in self.outputSpace) {
						var varSpace = self.outputSpace[varName];

						console.log(varSpace);
						var outputItem = Image.fromBase64(result[varName]);
						outputObject[varName] = outputItem;
					}

					console.log(outputObject);

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
		createModel: createModel,
	}
};
