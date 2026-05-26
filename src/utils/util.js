const crypto = require('crypto');

const hashing = (algorithm, data) => {
    const hash = crypto.createHash(algorithm);
    hash.update(data);
    const digested = hash.digest(data);
    return digested.toString('hex');
};

const pagination = (page=1, pageSize, records) => {
    return records.splice(pageSize * (page - 1), pageSize * page);
};

module.exports = { hashing, pagination };