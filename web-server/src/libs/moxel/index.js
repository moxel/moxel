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

		// Convert to bytes.
		toBytes(mime) {
			return deasync(this.img.getBuffer).bind(this.img)(mime)
		}

		// Convert to base64 encoding.
		toDataURL(mine) {
			return 'data:' + mine + ';base64,' + this.toBase64(mine);
		}

		// Convert to base64 encoding.
		toBase64(mine) {
			var bytes = this.toBytes(mine);
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
			this.inputSpace = result.metadata['input_space'];
			console.log('space', this.inputSpace);
			this.outputSpace = result.metadata['output_space'];

			this.predict = this.predict.bind(this);
		}

		predict(kwargs) {
			return new Promise(function(resolve, reject) {
				// Wrap input.
				inputObject = {};
				for(var varName in this.inputSpace) {
					var varSpace = this.inputSpace[varName];

					// Assume base64 encoding.
					// Only works for Image now.
					inputItem = kwargs[varName].toBase64();
					inputObject[varName] = inputItem;
				}

				// Make HTTP REST request.
				fetch(MODEL_ENDPOINT + '/' + this.user + '/' + this.model + '/' + this.tag,
					{method: 'POST'}).then((response) => {
					return response.json();
				}.then((result) => {
					// Parse result.
					var outputObject = {};

					for(var varName in this.outputSpace) {
						var varSpace = this.outputSpace[varName];

						var outputItem = varSpace.fromBase64(result[varName]);
						outputObject[varName] = outputItem;
					}

					resolve(outputObject);
				}.bind(this));	
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
					resolve(result);
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
