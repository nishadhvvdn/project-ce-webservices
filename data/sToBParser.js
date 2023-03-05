function sToBParser(data, len, type, callback) {
    var hex, i;
    var result = '';
    switch (type) {
        case 'string':
        case 'char':
            for (i = 0; i < len; i++) {
                if (data.charCodeAt(i)) {
                    hex = data.charCodeAt(i).toString(16);
                    result += (hex).slice(-4);
                } else {
                    result += '00';
                }
            }
            break;
        case 'int':
            if (len === "1") {
                var binarySize = len * 2;
                var s = data.toString(16) + "";
                while (s.length < 2)
                    s = "0" + s;
                while (s.length < binarySize)
                    s = s + "0";
                result += s;
            } else if (len === '8') {
                var hex_buf = new Uint8Array(8);
                var pos = 8;
                while (pos > 0) {
                    hex_buf[--pos] = data & 255;
                    data /= 256;
                }
                
                var s = '';
                hex_buf.forEach(function (byte) {
                    s += ('0' + (byte & 0xFF).toString(16)).slice(-2);
                });
                result += s;
            } else {
                var buf = new Buffer(2);
                buf.writeUInt16LE('0x' + data.toString(16), 0);
                var s = buf.readUInt16BE(0).toString(16) + "";
                var binarySize = len * 2;
                while (s.length <= 3)
                    s = "0" + s;
                while (s.length < binarySize)
                    s = s + "0";
                result += s;
            }
            break;
        case 'boolean':
            var binarySize = len * 1;
            var s = data.toString(16) + "";
            while (s.length < 1)
                s = "0" + s;
            while (s.length < binarySize)
                s = s + "0";
            result += s;
            break;
        case 'float':
            // convertion section added for float data type
            const getHex = i => ('00' + i.toString(16)).slice(-2);
            var view = new DataView(new ArrayBuffer(4)),
                result;
            view.setFloat32(0, data);
            result = Array
                .apply(null, { length: len })
                .map((_, i) => getHex(view.getUint8(i)))
                .join('');
            break;
    }
    return callback(null, result);
};

module.exports = {
    sToBParser: sToBParser
}
