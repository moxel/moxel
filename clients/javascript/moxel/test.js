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

function testBytes() {
	fs.readFile('examples/ansel_adams3.jpg', 
		function (err, data) {
		  if (err) throw err;
		  (new moxel.space.Bytes(data)).toBase64().then((results) => {
              console.log(results)
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

function testLoadRutnimeExample() {
	moxel.createModel('strin/colorization:latest').then((model) => {
		model.loadRuntimeExample('fe9d0915-67c7-4a49-9257-450364fcc64d').then((result) => {
			result.input.img_in.toJimp().then((img) => img.write('examples/colorization-loaded-input.jpg'));
			result.output.img_out.toJimp().then((img) => img.write('examples/colorization-loaded-output.jpg'));
		})
	}).catch((err) => {
		console.log('Error', err);
	});
}

function testLoadDemoExample() {
	moxel.createModel('strin/colorization:latest').then((model) => {
		model.loadDemoExample('75330543be6b7f2f725a1e2f6b45f1bc').then((result) => {
			result.input.img_in.toJimp().then((img) => img.write('examples/colorization-loaded-input.jpg'));
			result.output.img_out.toJimp().then((img) => img.write('examples/colorization-loaded-output.jpg'));
		})
	}).catch((err) => {
		console.log('Error', err);
	});
}

function testListDemoExamples() {
	moxel.createModel('strin/colorization:latest')
	.then((model) => {
		return model.listDemoExamples();
	})
	.then((result) => {
		console.log(result);
	});
}

function testSaveDemoExample() {
	moxel.createModel('strin/colorization:latest').then((model) => {
		model.loadRuntimeExample('fe9d0915-67c7-4a49-9257-450364fcc64d').then((result) => {
			model.saveDemoExample(result.input, result.output);
		})
	}).catch((err) => {
		console.log('Error', err);
	});
}

// testColorization();
// testImage();
// testLoadDemoExample();
// testListDemoExamples();
// testSaveDemoExample();
testBytes();