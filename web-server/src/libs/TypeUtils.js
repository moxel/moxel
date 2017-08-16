class TypeUtilsClass {
	constructor() {
		this.base64ToDataURL = this.base64ToDataURL.bind(this);
		this.adaptDataType = this.adaptDataType.bind(this);
		this.base64FromDataURL = this.base64FromDataURL.bind(this);
	}

	base64FromDataURL(dataURL) {
		var dataType = null;
        switch(dataURL.substring(5, dataURL.indexOf(";base64"))) {
            case 'image/png':
                dataType = 'base64.png';
                break;
            case 'image/jpeg':
                dataType = 'base64.jpg';
                break;
            default:
                console.error('Unknown data type for URL:', dataURL);
                return;
        }
        var data = dataURL.substring(dataURL.indexOf("base64,") + 7, dataURL.length);
        return {
        	data: data,
        	dataType: dataType
        }
	}

	base64ToDataURL(data, dataType) {
		var header = '';
		if(dataType == 'base64.jpg') {
			header = 'data:image/jpeg;base64,'
		}else if(dataType == 'base64.png') {
			header = 'data:image/png;base64,'
		}else{
			console.error('base64ToDataURL. Unknown dataType:', dataType);
		}
		return header + data;
	}

	adaptDataType(inputType, inputData, outputType) {
		return new Promise(function(resolve, reject) {
			if(inputType == 'base64.png' || inputType == 'base64.jpg') {
				var image = new Image();
				image.addEventListener('load', function() {
					var canvas = document.createElement('canvas');
					canvas.width = image.width;
					canvas.height = image.height;
					canvas.getContext('2d').drawImage(image, 0, 0);
					if(outputType == 'base64.jpg') {
						resolve(this.base64FromDataURL(canvas.toDataURL('image/jpg')).data);
					}else if(outputType == 'base64.png') {
						resolve(this.base64FromDataURL(canvas.toDataURL('image/png')).data);
					}else{
						reject("Unknown outputType: " + outputType);
					}
				}.bind(this));
				image.src = this.base64ToDataURL(inputData, inputType);
			}else{
				reject("Unknown inputType: " + inputType);
			}
		}.bind(this));
	}			
}

const TypeUtils = new TypeUtilsClass();

export default TypeUtils;