window.Buffer = require('buffer')

class Image {
    constructor(domImage) {
        this.domImage = domImage;

        this.toBytes = this.toBytes.bind(this);
    }

    toBytes(mime) {
        if (!mime) {
            mime = 'image/png';
        }
        var self = this;
        return new Promise((resolve, reject) => {
            var img = self.domImage;
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL(mime);
            var base64 = dataURL.replace(/^data:image\/(png|jpg|jpeg|pdf);base64,/, "");
            resolve(Buffer.from(base64, 'base64'));
        });
    }
}

function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
module.exports = {
    fromBytes: function(data) {
        return new Promise((resolve, reject) => {
            var domImage = document.createElement('img');
            domImage.src = 'data:image/jpeg;base64,' + data.toString('base64');
            resolve(new Image(domImage));
        });
    }
}
