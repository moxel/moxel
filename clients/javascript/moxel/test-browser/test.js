config = {
    endpoint: 'http://dev.moxel.ai'
}

var moxel = Moxel(config)
var assert = chai.assert;

describe('Image', function() {
    describe('toDataURL()', function() {
        it('Image URL shoudn\'t be empty.', function(done) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://storage.googleapis.com/dummy-asset/test-images/dog.jpg', true);
            xhr.responseType = 'blob';

            xhr.onload = function(e) {
                // response is unsigned 8 bit integer
                console.log(this.response);
                var blob = this.response;
                var arrayBuffer;
                var fileReader = new FileReader();
                fileReader.onload = function() {
                    var data = this.result;
                    moxel.space.image
                        .fromBytes(data)
                        .then((image) => {
                            // console.log(image.toBytes('image/png'));
                            // console.log(image.toBase64('image/png'));
                            return image.toDataURL('image/png');
                        })
                        .then((dataURL) => {
                            assert(dataURL && dataURL.length > 0);
                            done()
                        });
                };
                fileReader.readAsArrayBuffer(blob);
            };

            xhr.send();

        });
    });
});
