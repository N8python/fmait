async function fmait(callbacks, array) {
    for (const callback of callbacks) {
        array = await Promise.all(array.map(item => Promise.resolve(callback(item))));
    }
    return array;
}

module.exports = fmait;