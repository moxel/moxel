var fs = require('fs');
const deasync = require('deasync');

process.on('unhandledRejection', r => console.error(r));

config = {
	endpoint: 'http://dev.moxel.ai'
}

moxel = require('.')(config)

function testImage() {
	fs.readFile('examples/ansel_adams3.jpg.jpg', 
		function (err, data) {
		  if (err) throw err;
		  var image = moxel.space.Image.fromBytes(data);
		  // console.log(image.toBytes('image/png'));
		  // console.log(image.toBase64('image/png'));
		  console.log(image.toDataURL('image/png'));
		}
	);
}


function testColorization() {
	moxel.createModel('jimfan/colorization:0.0.1').then((model) => {
		fs.readFile('examples/ansel_adams3.jpg', 
			function (err, data) {
			  console.log('hi');
			  if (err) throw err;
			  var image = moxel.space.Image.fromBytes(data);
			  console.log('model', model);
			  model.predict({
			  	img_in: image
			  }).then((result) => {
			  	console.log('result', result.img_out.img);
			  	result.img_out.img.write('examples/colorization.jpg');
			  	// console.log(deasync(result.img_out.img.getBuffer).bind(result.img_out.img)('image/jpeg'));
			  });
			}
		);
	}).catch((err) => {
		// console.log('Error', err);
	});
}

testColorization();