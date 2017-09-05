var fs = require('fs');
const deasync = require('deasync');

process.on('unhandledRejection', r => console.error(r));

config = {
	endpoint: 'http://dev.moxel.ai'
}

moxel = require('.')(config)

function testImage() {
	fs.readFile('examples/ansel_adams3.jpg', 
		function (err, data) {
		  if (err) throw err;
		  moxel.space.Image.fromBytes(data)
		  .then((image) => {
		  	// console.log(image.toBytes('image/png'));
			// console.log(image.toBase64('image/png'));
		  	return image.toDataURL('image/png');
		  })
		  .then((data) => {
		  	console.log(data);
		  });
		}
	);
}


function testColorization() {
	moxel.createModel('strin/colorization:latest').then((model) => {
		fs.readFile('examples/ansel_adams3.jpg', 
			function (err, data) {
			  if (err) throw err;
			  moxel.space.Image.fromBytes(data)
			  .then((image) => {
			  	console.log('model', model);
				return model.predict({
					img_in: image
				});
			  })
			  .then((result) => {
			  	console.log('result', result.img_out.img);
			  	result.img_out.img.write('examples/colorization.jpg');
			  });			  
			}
		);
	}).catch((err) => {
		console.log('Error', err);
	});
}

function testLoadExample() {
	moxel.createModel('strin/colorization:latest').then((model) => {
		model.loadExample('fe9d0915-67c7-4a49-9257-450364fcc64d').then((result) => {
			result.input.img_in.toJimp().then((img) => img.write('examples/colorization-loaded-input.jpg'));
			result.output.img_out.toJimp().then((img) => img.write('examples/colorization-loaded-output.jpg'));
		})
	}).catch((err) => {
		console.log('Error', err);
	});
}
testColorization();
// testImage();
// testLoadExample();
