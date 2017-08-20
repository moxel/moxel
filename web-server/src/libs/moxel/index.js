const fileType = require('file-type');
const Jimp = require("jimp");
const deasync = require('deasync');

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

	class Utils {
		parseModelId(modelId) {

		}
	}

	class Model {
		load(modelId) {

		}
	}

	return {
		Image: Image,
		Model: Model,
	}
};
