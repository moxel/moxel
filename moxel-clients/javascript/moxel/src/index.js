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
var md5 = require('md5');

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
	// // Use devbox endpoint for debugging only.
	// var API_ENDPOINT = "http://master-dev.dummy.ai:8080"
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
		getAssetURL(user, name, tag, path, verb, contentType) {
			if(!path.startsWith('/'))  {
				throw 'path must start with /';
			}
			if(!verb) verb = 'GET';
			if(!contentType) contentType = '';

			return new Promise((resolve, reject) => {
				var params = {
					user: user,
					name: name,
					cloud: 'gcloud',
					path: `${tag}${path}`,
					verb: verb,
					"content-type": contentType
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

		putExample(user, name, tag, exampleId, clientLatency) {
			var clientVersion = VERSION;
			return new Promise((resolve, reject) => {
				var params = {
					clientLatency: clientLatency,
					clientVersion: clientVersion
				};

				fetch(API_ENDPOINT + `/users/${user}/models/${name}/${tag}/examples/${exampleId}`, 
				{
					method: 'PUT',
					headers: new Headers({
						'Content-Type': 'application/json'
					}),
					body: JSON.stringify(params),
				})
				.then((response) => {
					resolve();
				})
				.catch((err) => {
					reject(err);
				})
			});
		}

		putDemoExample(user, name, tag, exampleId) {
			var clientVersion = VERSION;
			return new Promise((resolve, reject) => {
				fetch(API_ENDPOINT + `/users/${user}/models/${name}/${tag}/demo-examples/${exampleId}`, 
				{
					method: 'PUT',
					headers: new Headers({
						'Content-Type': 'application/json'
					})
				})
				.then((response) => {
					resolve();
				})
				.catch((err) => {
					reject(err);
				})
			});
		}

		listExample(user, name, tag) {
			return new Promise((resolve, reject) => {
				fetch(API_ENDPOINT + `/users/${user}/models/${name}/${tag}/examples`, 
				{
					method: 'GET',
				})
				.then((response) => {
					return response.json();
				})
				.then((result) => {
					resolve(result);
				})
				.catch((err) => {
					reject(err);
				})
			});
		}

		listDemoExample(user, name, tag) {
			return new Promise((resolve, reject) => {
				fetch(API_ENDPOINT + `/users/${user}/models/${name}/${tag}/demo-examples`, 
				{
					method: 'GET',
				})
				.then((response) => {
					return response.json();
				})
				.then((result) => {
					resolve(result);
				})
				.catch((err) => {
					reject(err);
				})
			});
		}


	}

	var masterAPI = new MasterAPI();

	class Image {
		static get type() {
			return "image";
		}

		// img is Jimp image.
		constructor(img) {
			this.img = img;
			this.img.rgba(false); // use RGB only.
			this.shape = this.shape.bind(this);
			this.toBytes = this.toBytes.bind(this);
			this.toBase64 = this.toBase64.bind(this);
			this.toDataURL = this.toDataURL.bind(this);
			this.toJimp = this.toJimp.bind(this);
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
			var self = this;
			return new Promise((resolve, reject) => {
				self.img.getBuffer(mime, (err, data) => {
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

		// Return Jimp representation.
		toJimp() {
			var self = this;

			return new Promise((resolve, reject) => {
				if(!self.img) {
					reject('No image available.')
				}
				resolve(self.img);
			})
		}
	}

	class MoxelArray {
		static get type() {
			return "array";
		}

		// N-dimensional array.
		constructor(array) {
			this.array = array;

			this.toJSON = this.toJSON.bind(this);
		}

		toJSON() {
			var self = this;
			return new Promise((resolve, reject) => {
				resolve(JSON.stringify(self.array));
			});
		}

		static fromJSON(json) {
			return new Promise((resolve, reject) => {
				resolve(new MoxelArray(JSON.parse(json)));
			});
		}
	}

	class MoxelBytes {
		static get type() {
			return "bytes";
		}

		constructor(data) {
			this.data = data;
			this.toBase64 = this.toBase64.bind(this);
		}

		toBase64() {
			var self = this;
			return new Promise((resolve, reject) => {
				resolve(Buffer(self.data).toString('base64'));
			})
		}

		static fromBase64(data) {
			return new Promise((resolve, reject) => {
				resolve(new MoxelBytes(Buffer.from(data, 'base64')));
			})
		}
	}

	class MoxelFloat {
		static get type() {
			return "float";
		}

		constructor(x) {
			this.x = x;

			this.toText = this.toText.bind(this);
		}

		fromText(text) {
			return new Promise((resolve, reject) => {
				resolve(new MoxelFloat(parseFloat(text)));
			});
		}

		toText() {
			var self = this;
			return new Promise((resolve, reject) => {
				resolve(String(self.x));
			});
		}
	}

	class MoxelInt {
		static get type() {
			return "int";
		}

		constructor(x) {
			this.x = x;

			this.toText = this.toText.bind(this);
		}

		fromText(text) {
			return new Promise((resolve, reject) => {
				resolve(new MoxelInt(parseInt(text)));
			});
		}

		toText() {
			var self = this;
			return new Promise((resolve, reject) => {
				resolve(String(self.x));
			});
		}
	}

	class MoxelBoolean {
		static get type() {
			return "bool";
		}

		constructor(x) {
			this.x = x;

			this.toText = this.toText.bind(this);
		}

		fromText(text) {
			return new Promise((resolve, reject) => {
				resolve(new MoxelBoolean(Boolean(text)));
			});
		}

		toText() {
			var self = this;
			return new Promise((resolve, reject) => {
				resolve(String(self.x));
			});
		}
	}

	class MoxelString {
		static get type() {
			return "str";
		}

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
		static get type() {
			return "json";
		}
		
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
		image: Image,
		str: MoxelString,
		bytes: MoxelBytes,
		json: MoxelJSON,
		float: MoxelFloat,
		int: MoxelInt,
		bool: MoxelBoolean,
		array: MoxelArray,
	};

	class Model {
		constructor(user, name, tag, result) {
			this.user = user;
			this.name = name;
			this.tag = tag;
			this.metadata = this.formatMetadata(result.metadata);
			this.spec = result.spec;
			this.status = result.status;
			this.inputSpace = Utils.parseSpaceObject(this.spec['input_space']);
			this.outputSpace = Utils.parseSpaceObject(this.spec['output_space']);

			this.predict = this.predict.bind(this);			
			this._store = this._store.bind(this);
			this.encode = this.encode.bind(this);
			this.decode = this.decode.bind(this);
			this._loadExample = this._loadExample.bind(this);
			this.loadRuntimeExample = this.loadRuntimeExample.bind(this);
			this.loadDemoExample = this.loadDemoExample.bind(this);
			this.saveRuntimeExample = this.saveRuntimeExample.bind(this);
			this.saveDemoExample = this.saveDemoExample.bind(this);
			this._listExamples = this._listExamples.bind(this);
			this.listRuntimeExamples = this.listRuntimeExamples.bind(this);
			this.listDemoExamples = this.listDemoExamples.bind(this);
		}

		formatMetadata(newMetadata) {
			var metadata = {
	            title: "Untitled",
	            description: "A magicical machine learning model",
	            labels: [],
	            links: {},
	            stars: 0,
	            lastUpdated: '1 days ago',
	            gallery: [],
	            readme: "",
	            access: "private"
	        };

	        for(var k in newMetadata) {
	        	metadata[k] = newMetadata[k];
	        }

	        metadata["stars"] = parseInt(metadata["stars"]);

	        return metadata;
		}

		// TODO: if user has access to this code, they can store anything on our cloud.
		// Save examples to cloud.
		// - `assets` is a dict of objects.
		// return exmapleId.
		_store(inputBlob, outputBlob, assets) {
			var self = this;

			return new Promise((resolve, reject) => {
				// Example id.
				var timeStart = new Date().getTime();
				var exampleBody = JSON.stringify({
					'input': inputBlob,
					'output': outputBlob
				});

				var exampleId = md5(`${self.user}/${self.name}:${self.tag}--` + exampleBody);

				// fetch data URL from API.
				console.log("About to store input and output");

				masterAPI.getAssetURL(self.user, self.name, self.tag, `/examples/${exampleId}`, 'PUT')
				.then((url) => {
					console.log("Generated asset url " + url);
					return fetch(url, {
						method: 'PUT',
						body: exampleBody,
						headers: {
							'Content-Type': 'application/octet-stream'
						}
					})
				})
				.then((response) => {
					return response.text();
				})
				.then((text) => {
					var clientLatency = new Date().getTime() - timeStart;
					return masterAPI.putExample(self.user, self.name, self.tag, exampleId, clientLatency);
				})
				.then(() => {
					// Store assets.
					if(!assets) return;

					for(var key in assets) {
						var asset = assets[key];
						masterAPI.getAssetURL(self.user, self.name, self.tag, `/examples/${exampleId}/${key}`, 'PUT', 'image/png')
						.then((url) => {
							console.log("Generated asset url " + url);
							return fetch(url, {
								method: 'PUT',
								body: asset
							})
						})
						.catch((err) => {
							reject(err);
						})
					}
				})
				.then(() => {
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
			if(!data) {
				throw 'Must have data to encode';
			}
			if(!dataSpace) {
				throw 'Must have data space to decode';
			}
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
						if(varSpace == space.image) {
							// Image.
							data[varName].toBase64('image/png').then((item) => {
								blob[varName] = item;
								callback();	
							});
						}else if(varSpace == space.str || varSpace == space.float || varSpace == space.int || varSpace == space.bool) {
							data[varName].toText().then((text) => {
								blob[varName] = text;
								callback();
							})
						}else if(varSpace == space.json) {
							data[varName].toObject().then((object) => {
								blob[varName] = object;
								callback();
							})
						}else if(varSpace == space.bytes) {
							data[varName].toBase64().then((b64) => {
								blob[varName] = b64;
								callback();
							});
						}else if(varSpace == space.array) {
							data[varName].toJSON().then((json) => {
								blob[varName] = json;
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
			if(!blob) {
				throw 'Must have blob to decode';
			}
			if(!dataSpace) {
				throw 'Must have data space to decode';
			}
			return new Promise((resolve, reject) => {
				var outputObject = {};
				async.forEachOf(dataSpace,
				(varSpace, varName, callback) => {
					if(varSpace == space.image) {
						space.image.fromBase64(blob[varName]).then((outputItem) => {
							outputObject[varName] = outputItem;
							callback();
						});							
					}else if(varSpace == space.json) {
						space.json.fromObject(blob[varName]).then((outputItem) => {
							outputObject[varName] = outputItem;
							callback();
						})
					}else if(varSpace == space.str || varSpace == space.int || varSpace == space.bool || varSpace == space.float) {
						space.str.fromText(blob[varName]).then((outputItem) => {
							outputObject[varName] = outputItem;
							callback();
						});
					}else if(varSpace == space.array) {
						space.array.fromJSON(blob[varName]).then((outputItem) => {
							outputObject[varName] = outputItem;
							callback();
						});
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

		_loadExample(exampleId, demo) {
			var self = this;

			return new Promise((resolve, reject) => {
				masterAPI.getAssetURL(self.user, self.name, self.tag, `/examples/${exampleId}`, 'GET')
				.then((url) => {
					return fetch(url, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/octet-stream'
						}
					})
				})
				.then((response) => {
					return response.json();
				})
				.then((result) => {
					var inputObject = {};
					var outputObject = {};
					self.decode(result.input, self.inputSpace)
					.then((object) => {
						inputObject = object;
						return self.decode(result.output, self.outputSpace);
					})
					.then((object) => {
						outputObject = object;
						resolve({
							'input': inputObject,
							'output': outputObject
						});
					});
				})
				.catch((err) => {
					reject(err);
				});	
			});
		}

		loadExampleAsset(exampleId, assetKey) {
			var self = this;

			return masterAPI.getAssetURL(self.user, self.name, self.tag, `/examples/${exampleId}/${assetKey}`, 'GET', 'ignore');
		}

		// Load example from cloud.
		// - assets is a list of keys to load.
		loadRuntimeExample(exampleId) {
			return this._loadExample(exampleId, false, assets);
		}

		loadDemoExample(exampleId) {
			return this._loadExample(exampleId, true);
		}

		_saveExample(inputObject, outputObject, clientLatency, demo, assets) {
			var self = this;
			var exampleId = null;

			return new Promise((resolve, reject) => {
				var inputBlob = {};
				var outputBlob = {};
				self.encode(inputObject, self.inputSpace)
				.then((blob) => {
					inputBlob = blob;
					return self.encode(outputObject, self.outputSpace);
				})
				.then((blob) => {
					outputBlob = blob;
					return self._store(inputBlob, outputBlob, assets);
				})
				.then((_exampleId) => {
					exampleId = _exampleId;
					if(demo) {
						return masterAPI.putDemoExample(self.user, self.name, self.tag, exampleId);	
					}else{
						return masterAPI.putExample(self.user, self.name, self.tag, exampleId, clientLatency);	
					}
				})
				.then(() => {
					resolve(exampleId);
				})
				.catch((err) => {
					reject(err);
				})
			});
		}

		saveRuntimeExample(inputObject, outputObject, clientLatency, assets) {
			return this._saveExample(inputObject, outputObject, clientLatency, false, assets);
		}

		saveDemoExample(inputObject, outputObject, assets) {
			return this._saveExample(inputObject, outputObject, null, true, assets)
		}

		_listExamples(demo) {
			var self = this;

			return new Promise((resolve, reject) => {
				if(demo) {
					masterAPI.listDemoExample(self.user, self.name, self.tag)
					.then((result) => {
						resolve(result);
					})
					.catch((err) => {
						reject(err);
					});
				}else{
					masterAPI.listExample(self.user, self.name, self.tag)
					.then((result) => {
						resolve(result);
					})
					.catch((err) => {
						reject(err);
					});
				}
				
			});
		}

		listRuntimeExamples() {
			return this._listExamples(false);
		}

		listDemoExamples() {
			return this._listExamples(true);
		}

		// Main prediction function.
		predict(kwargs) {
			var self = this;
			
			// First encodes inputObject (kwargs) into inputBlob.
			// Sends the inputBlob to API endpoint.
			// Get back an outputBlob.
			// Decode the outputBlob into outputObject.
			return new Promise(function(resolve, reject) {
				if(self.status != 'LIVE') {
					reject('The model must be in LIVE state');
				}

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
					if(response.status == 200) {
						return response.json();
					}else if(response.status == 500) {
						try {
							response.json()
							.then((obj) => {
								console.log('error obj', obj);
								reject(obj.error);
							})
							.catch((err) => {
								reject(err);
							});
						}catch(err) {
							reject(err);
						}
					}else{
						response.text().then((message) => {
							reject(message);
						});
					}
				}).then((outputBlob) => {
					// Parse result.
					console.log('Moxel output blob', outputBlob);
					// self._store(inputBlob, outputBlob).then((exampleId) => {console.log('exampleId', exampleId);});
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
				resolve(model);
			});
		});
	}	

	return {
		space: space,
		parseSpaceObject: Utils.parseSpaceObject,
		createModel: createModel,
		utils: Utils
	}
};

module.exports = Moxel;
