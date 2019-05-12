const Jimp = require('jimp');

class Image {
    constructor(jimpImage) {
        this.jimpImage = jimpImage;

        this.toBytes = this.toBytes.bind(this);
    }

    toBytes(mime) {
        if(!mime) {
            mime = 'image/png';
        }
        var self = this;
        return new Promise((resolve, reject) => {
            self.jimpImage.getBuffer(mime, (err, data) => {
                if(err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
}

module.exports = {
    fromBytes: function(data)  {
        return new Promise((resolve, reject) => {
            Jimp.read(data)
            .then((jimpImage) => {
                jimpImage.rgba(false); // use RGB only.
                resolve(new Image(jimpImage));
            }) .catch((err) => {
                reject(err)
            });
        });
    }
}
