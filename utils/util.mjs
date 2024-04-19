function genRandomUUID() {
    const chars = '0123456789abcdef';
    let uuid = '';
    for (let i = 0; i < 64; i++) {
        uuid += chars[Math.floor(Math.random() * chars.length)];
    }
    return uuid;
}

function genRandomId() {
    return Math.floor(Math.random() * 100000);
}

function byteArrayToHex(arr) {
    return Array.prototype.map.call(arr, function (x) {
        return ('00' + x.toString(16)).slice(-2);
    }).join('');
}

export {
    genRandomUUID,
    genRandomId,
    byteArrayToHex,
}