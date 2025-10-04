const toBase64 = str => Buffer.from(str).toString('base64');
const fromBase64 = str => Buffer.from(str, 'base64').toString();

module.exports = { enc: toBase64, dec: fromBase64 };