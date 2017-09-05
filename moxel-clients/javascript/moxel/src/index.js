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

var pjson = require('../package.json');
const VERSION = 'js-' + pjson.version;
console.log('Moxel client version', VERSION);


var Moxel = function(config) {

	if(!config || !config.endpoint) {
		var MOXEL_ENDPOINT = 'http://beta.moxel.ai';
	}else{
		var MOXEL_ENDPOINT = config.endpoint
	}

	var API_ENDPOINT = MOXEL_ENDPOINT + '/api';
	var MODEL_ENDPOINT = MOXEL_ENDPOINT + '/model';	

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

		static encodeQueryParams(params) {
			var esc = encodeURIComponent;
			return Object.keys(params)
			    .map(k => esc(k) + '=' + esc(params[k]))
			    .join('&');
		}

		static uuidv4() {
		  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		    return v.toString(16);
		  });
		}
	}

	class MasterAPI {
		constructor() {

		}

		// Get model metadata from Master Server.
		getModel(user, name, tag) {
			return new Promise((resolve, reject) => {
				fetch(API_ENDPOINT + '/users/' + user + '/models/' + name + '/' + tag)
				.then(function(response) {
					return response.json();
				})
				.then(function(result) {
					resolve(result);
				})
				.catch((err) => {
					reject(err);
				});
			})
		}

		// Get data URL for cloud storage.
		getAssetURL(user, name, tag, path) {
			if(!path.startsWith('/'))  {
				throw 'path must start with /';
			}
			return new Promise((resolve, reject) => {
				var params = {
					user: user,
					name: name,
					cloud: 'gcloud',
					path: `${tag}${path}`,
					verb: 'PUT'
				}
				fetch(
					API_ENDPOINT + `/url/data?${Utils.encodeQueryParams(params)}`, 
					{
						method: 'GET',
					}) 
				.then((response) => {
					return response.json();
				})
				.then((result) => {
					if(result.url) {
						resolve(result.url);
					}else{
						reject('Cannot get asset URL');
					}
				})
				.catch((err) => {
					reject(err);
				});
			});
		}
	}

	masterAPI = new MasterAPI();

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

	class MoxelString {
		// img is Jimp image.
		constructor(text) {
			this.text = text;

			this.toText = this.toText.bind(this);
		}

		static fromText(text) {
			return new Promise((resolve, reject) => {
				resolve(new MoxelString(text));
			});
		}

		toText() {
			var self = this;
			return new Promise((resolve, reject) => {
				resolve(self.text);
			});
		}
	}

	class MoxelJSON {
		// JSON object type.
		constructor(object) {
			this.object = object;

			this.toObject = this.toObject.bind(this);
		}

		static fromObject(object) {
			return new Promise((resolve, reject) => {
				resolve(new MoxelJSON(object));
			});
		}

		toObject() {
			var self = this;
			return new Promise((resolve, reject) => {
				resolve(self.object);
			});
		}
	}

	// define submodule space.
	var space = {
		Image: Image,
		String: MoxelString,
		JSON: MoxelJSON
	};

	class Model {
		constructor(user, name, tag, result) {
			this.user = user;
			this.name = name;
			this.tag = tag;
			this.metadata = result.metadata;
			this.status = result.status;
			this.inputSpace = Utils.parseSpaceObject(this.metadata['input_space']);
			this.outputSpace = Utils.parseSpaceObject(this.metadata['output_space']);

			this.predict = this.predict.bind(this);			
			this._store = this._store.bind(this);
			this.encode = this.encode.bind(this);
			this.decode = this.decode.bind(this);
		}

		// Save example to cloud, as 
		// {'input': inputBlob, 'output': outputBlob}
		// return exmapleId.
		_store(inputBlob, outputBlob) {
			var self = this;

			return new Promise((resolve, reject) => {
				// Example id.
				var exampleId = Utils.uuidv4();

				// fetch data URL from API.
				console.log("About to store input and output");

				masterAPI.getAssetURL(self.user, self.name, self.tag, `/examples/${exampleId}`)
				.then((url) => {
					console.log("Generated asset url " + url);
					return fetch(url, {
						method: 'PUT',
						body: JSON.stringify({
							'input': inputBlob,
							'output': outputBlob
						}),
						headers: {
							'Content-Type': 'application/octet-stream'
						}
					})
				})
				.then((response) => {
					return response.text();
				})
				.then((text) => {
					resolve(exampleId);
				})
				.catch((err) => {
					reject(err);
				})
			});
		}

		// Encode input into blobs.
		// Arguments:
		// - data: is a object mapping of varName to objects of Moxel Type.
		// - space: is the corresponding mapping of varName to varSpace.
		encode(data, dataSpace) {
			return new Promise((resolve, reject) => {
				var blob = {};
				async.forEachOf(dataSpace,
					(varSpace, varName, callback) => {
						// Assume base64 encoding.
						// Only works for Image now.
						if(!data[varName]) {
							throw 'Input must have argument ' + varName;
						}
						// console.log(data[varName]);
						if(varSpace == space.Image) {
							// Image.
							data[varName].toBase64('image/png').then((item) => {
								blob[varName] = item;
								callback();	
							});
						}else if(varSpace == space.String) {
							data[varName].toText().then((text) => {
								blob[varName] = text;
								callback();
							})
						}else{
							console.error('Unknown variable input space', varSpace);
						}
					},

					(err) => {
						if(err) {
							reject(err);
						}else{
							resolve(blob);
						}
					}
				)
			});
		}

		// Decode output from blobs.
		decode(blob, dataSpace) {
			return new Promise((resolve, reject) => {
				var outputObject = {};
				async.forEachOf(dataSpace,
				(varSpace, varName, callback) => {
					if(varSpace == space.Image) {
						space.Image.fromBase64(blob[varName]).then((outputItem) => {
							outputObject[varName] = outputItem;
							callback();
						});							
					}else if(varSpace == space.JSON) {
						space.JSON.fromObject(blob[varName]).then((outputItem) => {
							outputObject[varName] = outputItem;
							callback();
						})
					}else if(varSpace == space.String) {
						space.String.fromText(blob[varName]).then((outputItem) => {
							outputObject[varName] = outputItem;
							callback();
						})
					}else{
						console.error('Unknown variable output space', varSpace);
					}
				},
				(err) => {
					if(err) {
						reject(err);
					}else{
						resolve(outputObject);
					}
				})
			});
		}

		// Main prediction function.
		predict(kwargs) {
			var self = this;
			

			// First encodes inputObject (kwargs) into inputBlob.
			// Sends the inputBlob to API endpoint.
			// Get back an outputBlob.
			// Decode the outputBlob into outputObject.
			return new Promise(function(resolve, reject) {
				// Input encoding.
				var inputBlob = {};

				self.encode(kwargs, self.inputSpace)
				.then((blob) => {
					inputBlob = blob;
					console.log('Moxel input blob', inputBlob);
					// Make HTTP REST request.
					return fetch(MODEL_ENDPOINT + '/' + self.user + '/' + self.name + '/' + self.tag,
						{
							method: 'POST',
							headers: new Headers({
	                        	'Content-Type': 'application/json'
	                    	}),
	                    	body: JSON.stringify(inputBlob)
	                    }
					);
				}).then((response) => {
					return response.json();
				}).then((outputBlob) => {
					// Parse result.
					console.log('Moxel output blob', outputBlob);
					var outputObject = {};

					self._store(inputBlob, outputBlob);

					return self.decode(outputBlob, self.outputSpace);
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

			masterAPI.getModel(user, name, tag).then((result) => {
				var model = new Model(user, name, tag, result);
				if(model.status == 'LIVE') {
					resolve(model);
				}else{
					reject('The model must be in LIVE state');
				}
			});
		});
	}	

	return {
		space: space,
		createModel: createModel,
		utils: Utils
	}
};

module.exports = Moxel;
