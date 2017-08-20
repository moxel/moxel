config = {
	endpoint: 'http://dev.moxel.ai'
}

moxel = require('.')(config)

function testImage() {
	var fs = require('fs');
	fs.readFile('examples/20170819_KingPhoto_EN-US12664061376_1920x1200.jpg', 
		function (err, data) {
		  if (err) throw err;
		  var image = moxel.Image.fromBytes(data);
		  // console.log(image.toBytes('image/png'));
		  // console.log(image.toBase64('image/png'));
		  console.log(image.toDataURL('image/png'));
		}
	);
}

